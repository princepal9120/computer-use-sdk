import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError, unsupported } from "../../core/errors";
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
          return runPlaywrightAction(computer, "openai", action);
        },
        screenshot: () => computer.screenshot(),
        stop: () => computer.stop(),
      };
      return runtime;
    },
  };
}

interface OpenAIClient {
  responses: {
    create: (body: Record<string, unknown>) => Promise<OpenAIResponse>;
  };
}

interface OpenAIResponse {
  id?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
    actions?: Array<Record<string, unknown>>;
    call_id?: string;
    id?: string;
    status?: string;
    role?: string;
  }>;
  output_text?: string;
}

async function runOpenAILoop(
  client: OpenAIClient,
  computer: PlaywrightComputer,
  model: string,
  task: string,
  maxSteps: number,
): Promise<ToolResult> {
  const logs: string[] = [];
  let previousResponseId: string | undefined;

  for (let step = 0; step < maxSteps; step++) {
    const screenshot = await computer.screenshot();
    const body: Record<string, unknown> = {
      model,
      tools: [
        {
          type: "computer_use_preview",
          display_width: computer.display.width,
          display_height: computer.display.height,
          environment: "browser",
        },
      ],
      truncation: "auto",
    };

    if (previousResponseId) {
      body.previous_response_id = previousResponseId;
      body.input = [
        {
          type: "computer_call_output",
          call_id: "pending",
          output: {
            type: "computer_screenshot",
            image_url: `data:image/png;base64,${screenshot}`,
          },
        },
      ];
    } else {
      body.input = [
        {
          role: "user",
          content: [
            { type: "input_text", text: task },
            {
              type: "input_image",
              image_url: `data:image/png;base64,${screenshot}`,
            },
          ],
        },
      ];
    }

    let response: OpenAIResponse;
    try {
      response = await client.responses.create(body);
    } catch (error) {
      // Fallback: chat completions style message if responses API shape differs
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
    let acted = false;

    for (const item of outputs) {
      if (item.type === "computer_call" || item.type === "computer_use_preview") {
        const actions = (item as { actions?: Array<Record<string, unknown>> }).actions ?? [
          item as Record<string, unknown>,
        ];
        for (const raw of actions) {
          const mapped = mapOpenAIAction(raw);
          if (mapped) {
            await runPlaywrightAction(computer, "openai", mapped);
            logs.push(`step ${step}: ${mapped.type}`);
            acted = true;
          }
        }
        // fix call_id for next iteration if present
        if (item.call_id || item.id) {
          body.input = [
            {
              type: "computer_call_output",
              call_id: item.call_id ?? item.id,
              output: {
                type: "computer_screenshot",
                image_url: `data:image/png;base64,${await computer.screenshot()}`,
              },
            },
          ];
        }
      }
      if (item.type === "message" || item.role === "assistant") {
        const text = item.content?.map((c) => c.text).filter(Boolean).join("\n");
        if (text) {
          logs.push(text);
          return { type: "text", text: logs.join("\n") };
        }
      }
    }

    if (response.output_text) {
      logs.push(response.output_text);
      return { type: "text", text: logs.join("\n") };
    }
    if (!acted) break;
  }

  return { type: "text", text: logs.join("\n") || "OpenAI computer-use finished without final text" };
}

function mapOpenAIAction(raw: Record<string, unknown>): ToolAction | null {
  const type = String(raw.type ?? raw.action ?? "");
  const x = Number(raw.x ?? (raw.coordinate as number[] | undefined)?.[0] ?? 0);
  const y = Number(raw.y ?? (raw.coordinate as number[] | undefined)?.[1] ?? 0);

  switch (type) {
    case "screenshot":
      return { type: "screenshot" };
    case "click":
    case "left_click":
      return { type: "left_click", coordinate: [x, y] };
    case "double_click":
      return { type: "double_click", coordinate: [x, y] };
    case "right_click":
      return { type: "right_click", coordinate: [x, y] };
    case "move":
    case "mouse_move":
      return { type: "mouse_move", coordinate: [x, y] };
    case "type":
    case "type_text":
      return { type: "type", text: String(raw.text ?? raw.keys ?? "") };
    case "keypress":
    case "key":
      return { type: "key", text: String(raw.key ?? raw.keys ?? raw.text ?? "") };
    case "scroll":
      return {
        type: "mouse_scroll",
        coordinate: [x, y],
        scrollDirection: Number(raw.scroll_y ?? raw.deltaY ?? 0) >= 0 ? "down" : "up",
        scrollAmount: Math.abs(Number(raw.scroll_y ?? raw.deltaY ?? 1)),
      };
    case "drag":
      return {
        type: "left_click_drag",
        startCoordinate: [
          Number((raw.path as Array<{ x: number }> | undefined)?.[0]?.x ?? x),
          Number((raw.path as Array<{ y: number }> | undefined)?.[0]?.y ?? y),
        ],
        coordinate: [x, y],
      };
    case "wait":
      return { type: "wait", ms: Number(raw.ms ?? 1000) };
    default:
      if (isComputerActionType(type)) return raw as unknown as ComputerAction;
      return null;
  }
}

// silence unused if tree-shaken
void unsupported;
