import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ComputerAction, Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { isComputerActionType, loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { openaiCapabilities } from "../capabilities";

const execFileAsync = promisify(execFile);

export interface OpenAIComputerOptions {
  apiKey?: string;
  model?: string;
  /** Start URL for the local browser environment. */
  startUrl?: string;
  display?: Partial<Display>;
  cwd?: string;
}

export { openaiCapabilities };

/**
 * OpenAI Computer Use — local Playwright env + OpenAI computer-use model loop.
 * Peer: `openai`. Env: `OPENAI_API_KEY`.
 *
 * Browser ✅ · Desktop ✅ (host shell) · API ✅
 */
export function openai(options: OpenAIComputerOptions = {}): ComputerProvider {
  return {
    id: "openai",
    capabilities: openaiCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "OPENAI_API_KEY",
        options.apiKey ?? process.env.OPENAI_API_KEY,
        "openai",
      );
      const model =
        options.model
        ?? process.env.OPENAI_COMPUTER_USE_MODEL
        ?? "computer-use-preview";

      const mod = await loadOptionalPeer("openai", () => import("openai"), "openai");
      const OpenAI = (mod as unknown as { default: new (o: { apiKey: string }) => OpenAIClient })
        .default;
      const client = new OpenAI({ apiKey });
      const computer = await PlaywrightComputer.launch(display);
      if (options.startUrl) await computer.goto(options.startUrl);
      const cwd = options.cwd ?? createOptions.cwd ?? process.cwd();

      const runtime: ComputerRuntime = {
        id: `openai-${crypto.randomUUID().slice(0, 8)}`,
        raw: { client, computer },
        capabilities: openaiCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent") {
            return runOpenAILoop(client, computer, model, action.task, action.maxSteps ?? 20);
          }
          if (action.type === "bash") {
            const { stdout, stderr } = await execFileAsync("/bin/bash", ["-c", action.command], {
              cwd,
              maxBuffer: 10 * 1024 * 1024,
            });
            return {
              type: "text",
              text: `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ""}`.trim() || "(no output)",
            };
          }
          // Direct computer/browse actions run against the local Playwright env.
          // Anything else resolves to a clear `unsupported` error.
          return runPlaywrightAction(computer, "openai", action);
        },
        screenshot: () => computer.screenshot(),
        stop: () => computer.stop(),
      };
      return runtime;
    },
  };
}

/**
 * Minimal, accurate view of the openai v6 Responses API surface used here.
 * Mirrors `OpenAI.Responses.*` shapes without coupling to the dynamically
 * loaded peer's constructor typing (see `loadOptionalPeer`).
 */
interface OpenAIClient {
  responses: {
    create: (body: ResponsesRequest) => Promise<OpenAIResponse>;
  };
}

interface ComputerUseTool {
  type: "computer_use_preview";
  display_width: number;
  display_height: number;
  environment: "browser";
}

interface SafetyCheck {
  id: string;
  code?: string | null;
  message?: string | null;
}

/** `computer_call` output item: the action is nested under `.action`. */
interface OpenAIComputerAction {
  type: string;
  x?: number;
  y?: number;
  button?: "left" | "right" | "wheel" | "back" | "forward" | string;
  keys?: string[] | null;
  path?: Array<{ x: number; y: number }>;
  scroll_x?: number;
  scroll_y?: number;
  text?: string;
}

interface OpenAIOutputItem {
  type?: string;
  id?: string;
  call_id?: string;
  status?: string;
  role?: string;
  action?: OpenAIComputerAction;
  content?: Array<{ type?: string; text?: string }>;
  pending_safety_checks?: SafetyCheck[];
}

interface OpenAIResponse {
  id?: string;
  output?: OpenAIOutputItem[];
  output_text?: string;
}

type OpenAIInputItem =
  | {
      role: "user";
      content: Array<
        | { type: "input_text"; text: string }
        | { type: "input_image"; image_url: string }
      >;
    }
  | {
      type: "computer_call_output";
      call_id: string;
      output: { type: "computer_screenshot"; image_url: string };
      acknowledged_safety_checks?: SafetyCheck[];
    };

interface ResponsesRequest {
  model: string;
  tools: ComputerUseTool[];
  truncation: "auto";
  input: OpenAIInputItem[];
  previous_response_id?: string;
}

async function runOpenAILoop(
  client: OpenAIClient,
  computer: PlaywrightComputer,
  model: string,
  task: string,
  maxSteps: number,
): Promise<ToolResult> {
  const logs: string[] = [];
  const tools: ComputerUseTool[] = [
    {
      type: "computer_use_preview",
      display_width: computer.display.width,
      display_height: computer.display.height,
      environment: "browser",
    },
  ];

  // First turn: user task + a screenshot of the current screen.
  let input: OpenAIInputItem[] = [
    {
      role: "user",
      content: [
        { type: "input_text", text: task },
        {
          type: "input_image",
          image_url: `data:image/png;base64,${await computer.screenshot()}`,
        },
      ],
    },
  ];
  let previousResponseId: string | undefined;

  for (let step = 0; step < maxSteps; step++) {
    const request: ResponsesRequest = { model, tools, truncation: "auto", input };
    if (previousResponseId) request.previous_response_id = previousResponseId;

    let response: OpenAIResponse;
    try {
      response = await client.responses.create(request);
    } catch (error) {
      throw new ComputerUseError({
        code: "driver_error",
        provider: "openai",
        operation: "agent",
        message: error instanceof Error ? error.message : "OpenAI computer-use request failed",
        cause: error,
      });
    }

    previousResponseId = response.id;
    const outputs = response.output ?? [];

    // Collect any assistant text emitted this turn.
    for (const item of outputs) {
      if (item.type === "message" && item.content) {
        const text = item.content
          .map((c) => c.text)
          .filter(Boolean)
          .join("\n");
        if (text) logs.push(text);
      }
    }

    const computerCalls = outputs.filter((item) => item.type === "computer_call");

    // No pending computer action → the model is done; return final text.
    if (computerCalls.length === 0) {
      const finalText = response.output_text ?? logs.join("\n");
      return {
        type: "text",
        text: finalText || "OpenAI computer-use finished without final text",
      };
    }

    // Execute each requested action and reply with a `computer_call_output`
    // referencing the real `call_id` + a fresh screenshot.
    const nextInput: OpenAIInputItem[] = [];
    for (const call of computerCalls) {
      const mapped = call.action ? mapOpenAIAction(call.action) : null;
      if (mapped) {
        await runPlaywrightAction(computer, "openai", mapped);
        logs.push(`step ${step}: ${call.action?.type ?? mapped.type}`);
      } else if (call.action) {
        logs.push(`step ${step}: unsupported action ${call.action.type}`);
      }
      const shot = await computer.screenshot();
      const outputItem: OpenAIInputItem = {
        type: "computer_call_output",
        call_id: call.call_id ?? call.id ?? "",
        output: { type: "computer_screenshot", image_url: `data:image/png;base64,${shot}` },
      };
      if (call.pending_safety_checks?.length) {
        outputItem.acknowledged_safety_checks = call.pending_safety_checks;
      }
      nextInput.push(outputItem);
    }
    input = nextInput;
  }

  return {
    type: "text",
    text: logs.join("\n") || "OpenAI computer-use reached max steps",
  };
}

/** Normalize an OpenAI key name to a Playwright key/chord component. */
function toPlaywrightKey(key: string): string {
  const map: Record<string, string> = {
    ctrl: "Control",
    control: "Control",
    cmd: "Meta",
    command: "Meta",
    meta: "Meta",
    win: "Meta",
    super: "Meta",
    alt: "Alt",
    option: "Alt",
    opt: "Alt",
    shift: "Shift",
    enter: "Enter",
    return: "Enter",
    esc: "Escape",
    escape: "Escape",
    tab: "Tab",
    space: "Space",
    spacebar: "Space",
    backspace: "Backspace",
    delete: "Delete",
    del: "Delete",
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    arrowup: "ArrowUp",
    arrowdown: "ArrowDown",
    arrowleft: "ArrowLeft",
    arrowright: "ArrowRight",
    pageup: "PageUp",
    pagedown: "PageDown",
    home: "Home",
    end: "End",
  };
  const lower = key.toLowerCase();
  if (map[lower]) return map[lower];
  return key.length === 1 ? key : key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Map a Responses computer-use action (`item.action`) to this SDK's engine
 * actions. Returns null for actions with no local equivalent.
 */
function mapOpenAIAction(action: OpenAIComputerAction): ToolAction | null {
  const x = Number(action.x ?? 0);
  const y = Number(action.y ?? 0);

  switch (action.type) {
    case "screenshot":
      return { type: "screenshot" };
    case "click":
      switch (action.button) {
        case "right":
          return { type: "right_click", coordinate: [x, y] };
        case "wheel":
          return { type: "middle_click", coordinate: [x, y] };
        case "back":
          return { type: "key", text: "Alt+ArrowLeft" };
        case "forward":
          return { type: "key", text: "Alt+ArrowRight" };
        default:
          return { type: "left_click", coordinate: [x, y] };
      }
    case "double_click":
      return { type: "double_click", coordinate: [x, y] };
    case "move":
      return { type: "mouse_move", coordinate: [x, y] };
    case "scroll": {
      const dy = Number(action.scroll_y ?? 0);
      const dx = Number(action.scroll_x ?? 0);
      const amount = Math.max(1, Math.round((Math.abs(dy) || Math.abs(dx)) / 100));
      return {
        type: "mouse_scroll",
        coordinate: [x, y],
        scrollDirection: dy >= 0 ? "down" : "up",
        scrollAmount: amount,
      };
    }
    case "keypress": {
      const keys = action.keys ?? [];
      return { type: "key", text: keys.map(toPlaywrightKey).join("+") };
    }
    case "type":
      return { type: "type", text: String(action.text ?? "") };
    case "drag": {
      const path = action.path ?? [];
      const start = path[0];
      const end = path[path.length - 1] ?? start;
      return {
        type: "left_click_drag",
        startCoordinate: start ? [start.x, start.y] : undefined,
        coordinate: end ? [end.x, end.y] : [x, y],
      };
    }
    case "wait":
      return { type: "wait", ms: 1000 };
    default:
      if (isComputerActionType(String(action.type))) {
        return action as unknown as ComputerAction;
      }
      return null;
  }
}
