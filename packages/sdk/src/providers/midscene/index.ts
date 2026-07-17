import type { Browser, Page } from "playwright";
import { PlaywrightComputer } from "../../core/engine";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { loadOptionalPeer } from "../../internal/provider-utils";
import { midsceneCapabilities } from "../capabilities";

export interface MidsceneOptions {
  /** Playwright launch options / headed mode. */
  headless?: boolean;
  display?: Partial<Display>;
  /** OpenAI-compatible vision model config via env (OPENAI_API_KEY etc.). */
}

export { midsceneCapabilities };

/**
 * Midscene.js — AI browser automation with vision. Peer: `@midscene/web`.
 * Uses Playwright under the hood. Configure model keys via Midscene env vars.
 * All standard computer + browse actions work; `agent` / natural-language
 * extract use Midscene's vision models when available.
 */
export function midscene(options: MidsceneOptions = {}): ComputerProvider {
  return {
    id: "midscene",
    capabilities: midsceneCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };

      const playwright = await import("playwright");
      const browser = await playwright.chromium.launch({
        headless: options.headless ?? true,
        args: [`--window-size=${display.width},${display.height}`],
      });
      const context = await browser.newContext({
        viewport: { width: display.width, height: display.height },
      });
      const page = await context.newPage();
      const computer = PlaywrightComputer.attach(
        browser as Browser,
        page as Page,
        display,
        true,
      );

      const mod = await loadOptionalPeer(
        "@midscene/web",
        () => import("@midscene/web"),
        "midscene",
      );
      const PlaywrightAgent = (
        mod as unknown as {
          PlaywrightAgent?: new (page: unknown, opts?: Record<string, unknown>) => MidsceneAgent;
        }
      ).PlaywrightAgent
        ?? (
          mod as unknown as {
            default?: { PlaywrightAgent: new (page: unknown) => MidsceneAgent };
          }
        ).default?.PlaywrightAgent;

      if (!PlaywrightAgent) {
        throw new Error("@midscene/web missing PlaywrightAgent");
      }

      const agent = new PlaywrightAgent(page);

      const runtime: ComputerRuntime = {
        id: `midscene-${crypto.randomUUID().slice(0, 8)}`,
        raw: { page, agent, computer },
        capabilities: midsceneCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "agent":
              await agent.aiAction(action.task);
              return { type: "text", text: `Midscene completed: ${action.task}` };
            case "extract": {
              if (action.url) await page.goto(action.url, { waitUntil: "domcontentloaded" });
              try {
                const data = await agent.aiQuery(action.query);
                return { type: "json", data };
              } catch {
                // Fall back to DOM extract when vision model is unavailable
                return computer.extract(action.query);
              }
            }
            case "click":
              if (action.text && !action.selector && !action.coordinate) {
                try {
                  await agent.aiTap(action.text);
                  return { type: "text", text: `Tapped ${action.text}` };
                } catch {
                  return computer.clickTarget(action);
                }
              }
              return computer.clickTarget(action);
            case "type":
              if (!action.selector) {
                try {
                  await agent.aiInput(action.text, "the focused field");
                  return { type: "text", text: "Typed" };
                } catch {
                  return computer.typeText(action.text);
                }
              }
              return computer.typeText(action.text, action.selector);
            default:
              return runPlaywrightAction(computer, "midscene", action);
          }
        },
        screenshot: () => computer.screenshot(),
        async stop() {
          await computer.stop();
        },
      };
      return runtime;
    },
  };
}

interface MidsceneAgent {
  aiAction: (task: string) => Promise<unknown>;
  aiQuery: (query: string) => Promise<unknown>;
  aiTap: (locate: string) => Promise<unknown>;
  aiInput: (text: string, locate: string) => Promise<unknown>;
}
