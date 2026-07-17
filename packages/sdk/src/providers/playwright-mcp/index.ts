import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { PlaywrightComputer } from "../../core/engine";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { playwrightMcpCapabilities } from "../capabilities";

export interface PlaywrightMcpOptions {
  display?: Partial<Display>;
  /** Optional existing CDP endpoint (attach instead of launch). */
  cdpUrl?: string;
  startUrl?: string;
}

export { playwrightMcpCapabilities };

/**
 * Playwright MCP-style surface — local Chromium with tool names aligned to
 * common Playwright MCP server actions (navigate, click, type, screenshot…).
 * No extra peer; uses bundled Playwright.
 */
export function playwrightMcp(options: PlaywrightMcpOptions = {}): ComputerProvider {
  return {
    id: "playwright-mcp",
    capabilities: playwrightMcpCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };

      const computer = options.cdpUrl
        ? await PlaywrightComputer.connect(options.cdpUrl, display)
        : await PlaywrightComputer.launch(display);

      if (options.startUrl) await computer.goto(options.startUrl);

      /** MCP tool name → ToolAction */
      const fromMcp = (name: string, args: Record<string, unknown>): ToolAction | null => {
        switch (name) {
          case "browser_navigate":
          case "navigate":
            return { type: "goto", url: String(args.url ?? args.href ?? "") };
          case "browser_click":
          case "click":
            return {
              type: "click",
              selector: args.selector ? String(args.selector) : undefined,
              text: args.element ? String(args.element) : undefined,
              coordinate:
                args.x !== undefined
                  ? [Number(args.x), Number(args.y ?? 0)]
                  : undefined,
            };
          case "browser_type":
          case "type":
            return {
              type: "type",
              text: String(args.text ?? args.content ?? ""),
              selector: args.selector ? String(args.selector) : undefined,
            };
          case "browser_snapshot":
          case "browser_screenshot":
          case "screenshot":
            return { type: "screenshot" };
          case "browser_wait":
          case "wait":
            return {
              type: "wait",
              ms: Number(args.time ?? args.ms ?? 1000),
              selector: args.selector ? String(args.selector) : undefined,
            };
          default:
            return null;
        }
      };

      const runtime: ComputerRuntime<{
        computer: PlaywrightComputer;
        callMcpTool: (name: string, args?: Record<string, unknown>) => Promise<ToolResult>;
      }> = {
        id: `playwright-mcp-${crypto.randomUUID().slice(0, 8)}`,
        raw: {
          computer,
          callMcpTool: async (name, args = {}) => {
            const action = fromMcp(name, args);
            if (!action) {
              return {
                type: "text",
                text: `Unknown MCP tool: ${name}`,
              };
            }
            return runPlaywrightAction(computer, "playwright-mcp", action);
          },
        },
        capabilities: playwrightMcpCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          // Allow passthrough of MCP-shaped pseudo actions via agent string "mcp:tool json"
          if (action.type === "agent" && action.task.startsWith("mcp:")) {
            const rest = action.task.slice(4).trim();
            const space = rest.indexOf(" ");
            const name = space === -1 ? rest : rest.slice(0, space);
            const args = space === -1 ? {} : (JSON.parse(rest.slice(space + 1)) as Record<string, unknown>);
            return runtime.raw.callMcpTool(name, args);
          }
          return runPlaywrightAction(computer, "playwright-mcp", action);
        },
        screenshot: () => computer.screenshot(),
        stop: () => computer.stop(),
      };
      return runtime;
    },
  };
}
