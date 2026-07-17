import type { Browser, Page } from "playwright";
import { PlaywrightComputer } from "../../core/engine";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { stagehandCapabilities } from "../capabilities";

export interface StagehandOptions {
  /** Browserbase keys used by Stagehand cloud env, or local. */
  env?: "LOCAL" | "BROWSERBASE";
  apiKey?: string;
  projectId?: string;
  modelName?: string;
  modelApiKey?: string;
  display?: Partial<Display>;
}

export { stagehandCapabilities };

/**
 * Stagehand (Browserbase) — AI-assisted browser framework.
 * Peer: `@browserbasehq/stagehand`.
 * Full computer + browse actions via Playwright; agent/extract via Stagehand AI.
 */
export function stagehand(options: StagehandOptions = {}): ComputerProvider {
  return {
    id: "stagehand",
    capabilities: stagehandCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const env = options.env ?? (process.env.BROWSERBASE_API_KEY ? "BROWSERBASE" : "LOCAL");

      if (env === "BROWSERBASE") {
        requireEnv(
          "BROWSERBASE_API_KEY",
          options.apiKey ?? process.env.BROWSERBASE_API_KEY,
          "stagehand",
        );
      }

      const mod = await loadOptionalPeer(
        "@browserbasehq/stagehand",
        () => import("@browserbasehq/stagehand"),
        "stagehand",
      );
      const Stagehand = (
        mod as unknown as { Stagehand: new (o: Record<string, unknown>) => StagehandClient }
      ).Stagehand;
      if (!Stagehand) throw new Error("@browserbasehq/stagehand missing Stagehand export");

      const sh = new Stagehand({
        env,
        apiKey: options.apiKey ?? process.env.BROWSERBASE_API_KEY,
        projectId: options.projectId ?? process.env.BROWSERBASE_PROJECT_ID,
        modelName: options.modelName ?? process.env.STAGEHAND_MODEL,
        modelClientOptions: options.modelApiKey
          ? { apiKey: options.modelApiKey }
          : undefined,
      });
      await sh.init();

      // Stagehand owns the browser lifecycle; attach without ownBrowser.
      const page = sh.page as Page;
      const browser = (page.context().browser() ?? sh.browser) as Browser | null;
      const computer = browser
        ? PlaywrightComputer.attach(browser, page, display, false)
        : null;

      const runtime: ComputerRuntime = {
        id: `stagehand-${crypto.randomUUID().slice(0, 8)}`,
        raw: sh,
        capabilities: stagehandCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "agent": {
              const result = await sh.act(action.task);
              return { type: "json", data: result };
            }
            case "extract": {
              if (action.url) await sh.page.goto(action.url);
              try {
                const data = await sh.extract(action.query);
                return { type: "json", data };
              } catch {
                if (computer) return computer.extract(action.query);
                throw new Error("Stagehand extract failed and no Playwright page attached");
              }
            }
            case "click":
              if (action.selector) {
                await sh.page.click(action.selector);
                return { type: "text", text: `Clicked ${action.selector}` };
              }
              if (action.coordinate && computer) {
                return computer.clickTarget(action);
              }
              if (action.text) {
                try {
                  await sh.act(`click on ${action.text}`);
                  return { type: "text", text: `Clicked text ${action.text}` };
                } catch {
                  if (computer) return computer.clickTarget(action);
                  throw new Error(`Unable to click text: ${action.text}`);
                }
              }
              if (computer) return computer.clickTarget(action);
              throw new Error("click requires selector, text, or coordinate");
            case "type":
              if (action.selector) {
                await sh.page.fill(action.selector, action.text);
                return { type: "text", text: `Typed into ${action.selector}` };
              }
              if (computer) return computer.typeText(action.text);
              await sh.act(`type ${JSON.stringify(action.text)}`);
              return { type: "text", text: "Typed" };
            default:
              if (computer) {
                try {
                  return await runPlaywrightAction(computer, "stagehand", action);
                } catch {
                  // fall through to act for free-form
                }
              }
              try {
                const result = await sh.act(JSON.stringify(action));
                return { type: "json", data: result };
              } catch {
                throw new Error(`stagehand does not support ${action.type}`);
              }
          }
        },
        async screenshot() {
          if (computer) return computer.screenshot();
          const buf = await sh.page.screenshot({ type: "png" });
          return Buffer.from(buf).toString("base64");
        },
        async stop() {
          await sh.close();
        },
      };
      return runtime;
    },
  };
}

interface StagehandClient {
  init: () => Promise<void>;
  close: () => Promise<void>;
  act: (instruction: string) => Promise<unknown>;
  extract: (instruction: string) => Promise<unknown>;
  browser?: Browser;
  page: {
    goto: (url: string) => Promise<unknown>;
    click: (sel: string) => Promise<unknown>;
    fill: (sel: string, text: string) => Promise<unknown>;
    waitForSelector: (sel: string) => Promise<unknown>;
    waitForTimeout: (ms: number) => Promise<unknown>;
    screenshot: (o: { type: "png" }) => Promise<Buffer | Uint8Array>;
    context: () => { browser: () => Browser | null };
  };
}
