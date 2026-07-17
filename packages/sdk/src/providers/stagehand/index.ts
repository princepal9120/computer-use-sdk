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
 * Peer: `@browserbasehq/stagehand` (v3).
 *
 * v3 no longer exposes `.page`/`.browser`. It runs a CDP-backed browser
 * (local Chrome or Browserbase) and exposes `connectURL()` for the browser
 * CDP endpoint plus a `context` with its own CDP pages. We connect Playwright
 * over that CDP endpoint for direct/computer actions, and delegate high-level
 * work (`agent`, `extract`, `act`) to Stagehand's AI methods.
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

      const shOptions: Record<string, unknown> = {
        env,
        apiKey: options.apiKey ?? process.env.BROWSERBASE_API_KEY,
        projectId: options.projectId ?? process.env.BROWSERBASE_PROJECT_ID,
      };
      const modelName = options.modelName ?? process.env.STAGEHAND_MODEL;
      if (modelName) {
        // v3 ModelConfiguration: a bare model id, or { modelName, apiKey, ... }.
        shOptions.model = options.modelApiKey
          ? { modelName, apiKey: options.modelApiKey }
          : modelName;
      }

      const sh = new Stagehand(shOptions);
      await sh.init();

      // Stagehand owns the browser lifecycle. Connect Playwright over its CDP
      // endpoint so direct/computer actions have a real browser + page.
      let computer: PlaywrightComputer | null = null;
      try {
        const cdpUrl = sh.connectURL();
        if (cdpUrl) computer = await PlaywrightComputer.connect(cdpUrl, display);
      } catch {
        computer = null;
      }

      const nativePage = (): StagehandNativePage | undefined =>
        sh.context.activePage() ?? sh.context.pages()[0];

      const runtime: ComputerRuntime = {
        id: `stagehand-${crypto.randomUUID().slice(0, 8)}`,
        raw: sh,
        capabilities: stagehandCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "agent": {
              // v3: agent({...}).execute(task) runs a multi-step AI agent.
              const result = await sh.agent().execute(action.task);
              return { type: "json", data: result };
            }
            case "extract": {
              if (action.url) {
                if (computer) await computer.goto(action.url);
                else await nativePage()?.goto(action.url);
              }
              try {
                const data = await sh.extract(action.query);
                return { type: "json", data };
              } catch {
                if (computer) return computer.extract(action.query);
                throw new Error("Stagehand extract failed and no Playwright page attached");
              }
            }
            case "click": {
              if ((action.selector || action.coordinate) && computer) {
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
            }
            case "type": {
              if (computer) return computer.typeText(action.text, action.selector);
              await sh.act(`type ${JSON.stringify(action.text)}`);
              return { type: "text", text: "Typed" };
            }
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
          const page = nativePage();
          if (!page) throw new Error("stagehand: no page available for screenshot");
          const buf = await page.screenshot();
          return Buffer.from(buf).toString("base64");
        },
        async stop() {
          if (computer) await computer.stop().catch(() => undefined);
          await sh.close().catch(() => undefined);
        },
      };
      return runtime;
    },
  };
}

/** Stagehand v3 CDP-backed page (subset used by this adapter). */
interface StagehandNativePage {
  goto: (
    url: string,
    options?: { waitUntil?: string; timeoutMs?: number },
  ) => Promise<unknown>;
  screenshot: (options?: { type?: "png" | "jpeg" }) => Promise<Buffer>;
}

interface StagehandContext {
  pages: () => StagehandNativePage[];
  activePage: () => StagehandNativePage | undefined;
}

interface StagehandAgent {
  execute: (task: string) => Promise<unknown>;
}

/** Local view of the v3 `Stagehand` (alias of `V3`) surface we use. */
interface StagehandClient {
  init: () => Promise<void>;
  close: (opts?: { force?: boolean }) => Promise<void>;
  act: (instruction: string) => Promise<unknown>;
  extract: (instruction: string) => Promise<unknown>;
  agent: (options?: Record<string, unknown>) => StagehandAgent;
  connectURL: () => string;
  readonly context: StagehandContext;
}
