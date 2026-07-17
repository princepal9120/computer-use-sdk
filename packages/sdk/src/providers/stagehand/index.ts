import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { unsupported } from "../../core/errors";
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

      const runtime: ComputerRuntime = {
        id: `stagehand-${crypto.randomUUID().slice(0, 8)}`,
        raw: sh,
        capabilities: stagehandCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "goto":
              await sh.page.goto(action.url);
              return { type: "text", text: `Navigated to ${action.url}` };
            case "agent": {
              const result = await sh.act(action.task);
              return { type: "json", data: result };
            }
            case "extract": {
              if (action.url) await sh.page.goto(action.url);
              const data = await sh.extract(action.query);
              return { type: "json", data };
            }
            case "click":
              if (action.selector) {
                await sh.page.click(action.selector);
                return { type: "text", text: `Clicked ${action.selector}` };
              }
              if (action.text) {
                await sh.act(`click on ${action.text}`);
                return { type: "text", text: `Clicked text ${action.text}` };
              }
              return unsupported("stagehand", "click");
            case "type":
              if (action.selector) {
                await sh.page.fill(action.selector, action.text);
                return { type: "text", text: `Typed into ${action.selector}` };
              }
              await sh.act(`type ${JSON.stringify(action.text)}`);
              return { type: "text", text: "Typed" };
            case "wait":
              if (action.selector) await sh.page.waitForSelector(action.selector);
              else await sh.page.waitForTimeout(action.ms ?? 1000);
              return { type: "text", text: "Waited" };
            case "screenshot": {
              const buf = await sh.page.screenshot({ type: "png" });
              return {
                type: "image",
                data: Buffer.from(buf).toString("base64"),
                mediaType: "image/png",
              };
            }
            default:
              // try act() for free-form computer-like actions
              if ("type" in action) {
                try {
                  const result = await sh.act(JSON.stringify(action));
                  return { type: "json", data: result };
                } catch {
                  return unsupported("stagehand", action.type);
                }
              }
              return unsupported("stagehand", (action as { type: string }).type);
          }
        },
        async screenshot() {
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
  page: {
    goto: (url: string) => Promise<unknown>;
    click: (sel: string) => Promise<unknown>;
    fill: (sel: string, text: string) => Promise<unknown>;
    waitForSelector: (sel: string) => Promise<unknown>;
    waitForTimeout: (ms: number) => Promise<unknown>;
    screenshot: (o: { type: "png" }) => Promise<Buffer | Uint8Array>;
  };
}
