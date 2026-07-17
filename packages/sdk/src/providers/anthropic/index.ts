import { execFile } from "node:child_process";
import { resolve as resolvePath } from "node:path";
import { promisify } from "node:util";
import { runEditorAction } from "../../core/editor";
import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ComputerAction, Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { anthropicCapabilities } from "../capabilities";

const execFileAsync = promisify(execFile);

export interface AnthropicComputerOptions {
  apiKey?: string;
  model?: string;
  startUrl?: string;
  display?: Partial<Display>;
  cwd?: string;
}

export { anthropicCapabilities };

/**
 * Anthropic Computer Use — local Playwright env + computer_20250124 tool loop.
 * Peer: `@anthropic-ai/sdk`. Env: `ANTHROPIC_API_KEY`.
 *
 * Browser ✅ · Desktop ✅ (host shell/editor) · API ✅
 */
export function anthropic(options: AnthropicComputerOptions = {}): ComputerProvider {
  return {
    id: "anthropic",
    capabilities: anthropicCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "ANTHROPIC_API_KEY",
        options.apiKey ?? process.env.ANTHROPIC_API_KEY,
        "anthropic",
      );
      const model =
        options.model
        ?? process.env.ANTHROPIC_COMPUTER_USE_MODEL
        ?? "claude-sonnet-4-20250514";

      const mod = await loadOptionalPeer(
        "@anthropic-ai/sdk",
        () => import("@anthropic-ai/sdk"),
        "anthropic",
      );
      const Anthropic = (
        mod as unknown as { default: new (o: { apiKey: string }) => AnthropicClient }
      ).default;
      const client = new Anthropic({ apiKey });
      const computer = await PlaywrightComputer.launch(display);
      if (options.startUrl) await computer.goto(options.startUrl);
      const cwd = options.cwd ?? createOptions.cwd ?? process.cwd();

      const runtime: ComputerRuntime = {
        id: `anthropic-${crypto.randomUUID().slice(0, 8)}`,
        raw: { client, computer },
        capabilities: anthropicCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent") {
            return runAnthropicLoop(
              client,
              computer,
              model,
              display,
              cwd,
              action.task,
              action.maxSteps ?? 20,
            );
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
          if (
            action.type === "view"
            || action.type === "create"
            || action.type === "str_replace"
            || action.type === "insert"
          ) {
            const result = await runEditorAction(action, (p) =>
              p.startsWith("/") ? p : resolvePath(cwd, p),
            );
            return { type: "text", text: result.output };
          }
          return runPlaywrightAction(computer, "anthropic", action);
        },
        screenshot: () => computer.screenshot(),
        stop: () => computer.stop(),
      };
      return runtime;
    },
  };
}

interface AnthropicClient {
  beta: {
    messages: {
      create: (body: Record<string, unknown>) => Promise<AnthropicMessage>;
    };
  };
  messages: {
    create: (body: Record<string, unknown>) => Promise<AnthropicMessage>;
  };
}

interface AnthropicMessage {
  content: Array<{
    type: string;
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  }>;
  stop_reason?: string | null;
}

async function runAnthropicLoop(
  client: AnthropicClient,
  computer: PlaywrightComputer,
  model: string,
  display: Display,
  cwd: string,
  task: string,
  maxSteps: number,
): Promise<ToolResult> {
  const tools = [
    {
      type: "computer_20250124",
      name: "computer",
      display_width_px: display.width,
      display_height_px: display.height,
      display_number: 1,
    },
    { type: "bash_20250124", name: "bash" },
    { type: "text_editor_20250124", name: "str_replace_editor" },
  ];

  type Msg = { role: string; content: unknown };
  const messages: Msg[] = [{ role: "user", content: task }];
  const logs: string[] = [];

  for (let step = 0; step < maxSteps; step++) {
    let response: AnthropicMessage;
    try {
      response = await client.beta.messages.create({
        model,
        max_tokens: 4096,
        tools,
        messages,
        betas: ["computer-use-2025-01-24"],
      });
    } catch {
      response = await client.messages.create({
        model,
        max_tokens: 4096,
        tools,
        messages,
      });
    }

    messages.push({ role: "assistant", content: response.content });
    const toolResults: Array<Record<string, unknown>> = [];

    for (const block of response.content) {
      if (block.type === "text" && block.text) logs.push(block.text);
      if (block.type !== "tool_use") continue;

      const name = block.name ?? "";
      const input = block.input ?? {};
      let resultText = "";
      let image: string | undefined;

      try {
        if (name === "computer") {
          const mapped = mapAnthropicComputer(input);
          if (mapped) {
            const out = await runPlaywrightAction(computer, "anthropic", mapped);
            resultText = out.type === "text" ? out.text : out.type;
            if (mapped.type === "screenshot" || out.type === "image") {
              image = out.type === "image" ? out.data : await computer.screenshot();
            }
          } else {
            resultText = `unknown computer action: ${JSON.stringify(input)}`;
          }
        } else if (name === "bash") {
          const cmd = String(input.command ?? "");
          const { stdout, stderr } = await execFileAsync("/bin/bash", ["-c", cmd], {
            cwd,
            maxBuffer: 10 * 1024 * 1024,
          });
          resultText = `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ""}`.trim() || "(no output)";
        } else if (name === "str_replace_editor" || name.includes("editor")) {
          const editorAction = mapEditor(input);
          if (editorAction) {
            const result = await runEditorAction(editorAction, (p) =>
              p.startsWith("/") ? p : resolvePath(cwd, p),
            );
            resultText = result.output;
          }
        }
      } catch (error) {
        resultText = error instanceof Error ? error.message : String(error);
      }

      if (image) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: [
            { type: "text", text: resultText || "ok" },
            {
              type: "image",
              source: { type: "base64", media_type: "image/png", data: image },
            },
          ],
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: resultText || "ok",
        });
      }
      logs.push(`tool ${name}: ${resultText.slice(0, 200)}`);
    }

    if (toolResults.length === 0) {
      return { type: "text", text: logs.join("\n") || "done" };
    }
    messages.push({ role: "user", content: toolResults });
    if (response.stop_reason === "end_turn") {
      return { type: "text", text: logs.join("\n") };
    }
  }

  return { type: "text", text: logs.join("\n") || "Anthropic computer-use max steps reached" };
}

function mapAnthropicComputer(input: Record<string, unknown>): ToolAction | null {
  const action = String(input.action ?? "");
  const coord = input.coordinate as [number, number] | undefined;
  switch (action) {
    case "screenshot":
      return { type: "screenshot" };
    case "mouse_move":
      return { type: "mouse_move", coordinate: coord ?? [0, 0] };
    case "left_click":
      return { type: "left_click", coordinate: coord };
    case "right_click":
      return { type: "right_click", coordinate: coord };
    case "middle_click":
      return { type: "middle_click", coordinate: coord };
    case "double_click":
      return { type: "double_click", coordinate: coord };
    case "triple_click":
      return { type: "triple_click", coordinate: coord };
    case "left_click_drag":
      return {
        type: "left_click_drag",
        coordinate: coord ?? [0, 0],
        startCoordinate: input.start_coordinate as [number, number] | undefined,
      };
    case "scroll":
    case "mouse_scroll":
      return {
        type: "mouse_scroll",
        coordinate: coord ?? [0, 0],
        scrollDirection: (input.scroll_direction as "up" | "down") ?? "down",
        scrollAmount: Number(input.scroll_amount ?? 1),
      };
    case "type":
      return { type: "type", text: String(input.text ?? "") };
    case "key":
      return { type: "key", text: String(input.text ?? input.key ?? "") };
    case "wait":
      return { type: "wait", ms: Number(input.duration ?? input.ms ?? 1000) };
    default:
      if (action) return { type: action, ...input } as ComputerAction;
      return null;
  }
}

function mapEditor(input: Record<string, unknown>) {
  const command = String(input.command ?? input.type ?? "");
  const path = String(input.path ?? "");
  switch (command) {
    case "view":
      return {
        type: "view" as const,
        path,
        viewRange: input.view_range as [number, number] | undefined,
      };
    case "create":
      return { type: "create" as const, path, fileText: String(input.file_text ?? "") };
    case "str_replace":
      return {
        type: "str_replace" as const,
        path,
        oldStr: String(input.old_str ?? ""),
        newStr: String(input.new_str ?? ""),
        replaceAll: Boolean(input.replace_all),
      };
    case "insert":
      return {
        type: "insert" as const,
        path,
        insertLine: Number(input.insert_line ?? 0),
        insertText: String(input.insert_text ?? ""),
      };
    default:
      return null;
  }
}

void ComputerUseError;
