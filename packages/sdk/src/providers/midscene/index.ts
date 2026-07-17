import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { unsupported } from "../../core/errors";
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
        raw: { page, agent },
        capabilities: midsceneCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "goto":
              await page.goto(action.url, { waitUntil: "domcontentloaded" });
              return { type: "text", text: `Navigated to ${action.url}` };
            case "agent":
              await agent.aiAction(action.task);
              return { type: "text", text: `Midscene completed: ${action.task}` };
            case "extract": {
              if (action.url) await page.goto(action.url, { waitUntil: "domcontentloaded" });
              const data = await agent.aiQuery(action.query);
              return { type: "json", data };
            }
            case "click":
              if (action.text) {
                await agent.aiTap(action.text);
                return { type: "text", text: `Tapped ${action.text}` };
              }
              if (action.selector) {
                await page.click(action.selector);
                return { type: "text", text: `Clicked ${action.selector}` };
              }
              return unsupported("midscene", "click");
            case "type":
              if (action.selector) {
                await page.fill(action.selector, action.text);
              } else {
                await agent.aiInput(action.text, "the focused field");
              }
              return { type: "text", text: "Typed" };
            case "wait":
              if (action.selector) await page.waitForSelector(action.selector);
              else await page.waitForTimeout(action.ms ?? 1000);
              return { type: "text", text: "Waited" };
            case "screenshot": {
              const buf = await page.screenshot({ type: "png" });
              return {
                type: "image",
                data: buf.toString("base64"),
                mediaType: "image/png",
              };
            }
            default:
              return unsupported("midscene", action.type);
          }
        },
        async screenshot() {
          const buf = await page.screenshot({ type: "png" });
          return buf.toString("base64");
        },
        async stop() {
          await browser.close();
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
