import { chromium, type Browser, type Locator, type Page } from "playwright";
import { PlaywrightComputer } from "../../core/engine";
import { unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { agentqlCapabilities } from "../capabilities";

export interface AgentQLOptions {
  apiKey?: string;
  display?: Partial<Display>;
  headless?: boolean;
}

export { agentqlCapabilities };

/**
 * AgentQL — DOM AI queries for web apps. Peer: `agentql`. Env: `AGENTQL_API_KEY`.
 * Full computer + browse actions via Playwright; `extract` / NL click via AgentQL.
 */
export function agentql(options: AgentQLOptions = {}): ComputerProvider {
  return {
    id: "agentql",
    capabilities: agentqlCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "AGENTQL_API_KEY",
        options.apiKey ?? process.env.AGENTQL_API_KEY,
        "agentql",
      );

      // Configure env for agentql SDK
      process.env.AGENTQL_API_KEY = apiKey;

      const mod = await loadOptionalPeer("agentql", () => import("agentql"), "agentql");
      const wrap =
        (mod as unknown as { wrap: (page: Page) => Promise<AgentQLPage> }).wrap
        ?? (mod as unknown as { default?: { wrap: (page: Page) => Promise<AgentQLPage> } }).default
          ?.wrap;
      if (!wrap) throw new Error("agentql package missing wrap()");

      const browser: Browser = await chromium.launch({
        headless: options.headless ?? true,
        args: [`--window-size=${display.width},${display.height}`],
      });
      const context = await browser.newContext({
        viewport: { width: display.width, height: display.height },
      });
      const page = await context.newPage();
      const aql = await wrap(page);
      const computer = PlaywrightComputer.attach(browser, page, display, true);

      const runtime: ComputerRuntime = {
        id: `agentql-${crypto.randomUUID().slice(0, 8)}`,
        raw: { page, aql, computer },
        capabilities: agentqlCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "extract": {
              if (action.url) await page.goto(action.url, { waitUntil: "domcontentloaded" });
              // `extract.query` is natural language. AgentQL v1.18.1 exposes NO
              // natural-language DATA method — `queryData`/`queryElements` require
              // AgentQL query SYNTAX and throw on free text. The only NL primitive
              // is `page.getByPrompt(prompt)`, which locates the element described
              // by the prompt. Return that element's text content.
              const locator = await aql.getByPrompt(action.query);
              if (locator) {
                const text =
                  (await locator.innerText().catch(() => null))
                  ?? (await locator.textContent().catch(() => null));
                return {
                  type: "json",
                  data: { query: action.query, text: text?.trim() ?? "", source: "agentql" },
                };
              }
              // Explicit last resort: AgentQL located no matching element for the
              // NL query. Fall back to plain DOM extraction (not a mask of a broken
              // primary path — getByPrompt genuinely returned no element).
              return computer.extract(action.query);
            }
            case "click": {
              if (action.selector || action.coordinate) {
                return computer.clickTarget(action);
              }
              // Natural-language click via AgentQL's NL element locator.
              const prompt = action.text ?? "primary button";
              const locator = await aql.getByPrompt(prompt);
              if (locator) {
                await locator.click({ timeout: 15_000 });
                return { type: "text", text: `Clicked via AgentQL: "${prompt}"` };
              }
              // Last resort: Playwright text match when AgentQL finds nothing.
              if (action.text) return computer.clickTarget(action);
              return unsupported("agentql", "click");
            }
            case "type":
              if (action.selector) {
                return computer.typeText(action.text, action.selector);
              }
              return computer.typeText(action.text);
            default:
              return runPlaywrightAction(computer, "agentql", action);
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

/**
 * Minimal shape of AgentQL's wrapped Playwright page (`PageExt`) used here.
 * `getByPrompt` is the natural-language element locator; `queryData` /
 * `queryElements` require AgentQL query SYNTAX and are not used for NL input.
 */
interface AgentQLPage {
  getByPrompt: (
    prompt: string,
    options?: {
      timeout?: number;
      waitForNetworkIdle?: boolean;
      includeHidden?: boolean;
      mode?: "standard" | "fast";
    },
  ) => Promise<Locator | null>;
  queryData: (query: string) => Promise<Record<string, unknown>>;
  queryElements: (query: string) => Promise<unknown>;
}
