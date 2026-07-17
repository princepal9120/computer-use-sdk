import { PlaywrightComputer } from "../../core/engine";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { browserbaseCapabilities } from "../capabilities";

export interface BrowserbaseOptions {
  apiKey?: string;
  projectId?: string;
  display?: Partial<Display>;
  /** Reconnect to an existing Browserbase session. */
  sessionId?: string;
  /** Extra session create fields (region, proxies, …). */
  create?: Record<string, unknown>;
}

export { browserbaseCapabilities };

/**
 * Hosted browser via Browserbase CDP. Plug in with `BROWSERBASE_API_KEY` +
 * `BROWSERBASE_PROJECT_ID` and optional peer `@browserbasehq/sdk`.
 */
export function browserbase(
  options: BrowserbaseOptions = {},
): ComputerProvider<{ sessionId: string; computer: PlaywrightComputer }> {
  return {
    id: "browserbase",
    capabilities: browserbaseCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "BROWSERBASE_API_KEY",
        options.apiKey ?? process.env.BROWSERBASE_API_KEY,
        "browserbase",
      );
      const projectId = requireEnv(
        "BROWSERBASE_PROJECT_ID",
        options.projectId ?? process.env.BROWSERBASE_PROJECT_ID,
        "browserbase",
      );

      const { Browserbase } = await loadOptionalPeer(
        "@browserbasehq/sdk",
        () => import("@browserbasehq/sdk"),
        "browserbase",
      );

      const bb = new Browserbase({ apiKey }) as unknown as {
        sessions: {
          create: (body: Record<string, unknown>) => Promise<{ id: string; connectUrl?: string }>;
          get?: (id: string) => Promise<{ id: string; connectUrl?: string }>;
          retrieve?: (id: string) => Promise<{ id: string; connectUrl?: string }>;
          debug?: (id: string) => Promise<{ wsUrl?: string }>;
          update: (id: string, body: Record<string, unknown>) => Promise<unknown>;
        };
      };
      let sessionId = options.sessionId;
      let connectUrl: string;

      const sessions = bb.sessions;

      if (sessionId) {
        const session =
          (await sessions.get?.(sessionId))
          ?? (await sessions.retrieve?.(sessionId));
        if (!session) {
          throw new Error(`Unable to load Browserbase session ${sessionId}`);
        }
        connectUrl =
          session.connectUrl
          ?? (await sessions.debug?.(sessionId))?.wsUrl
          ?? "";
      } else {
        const session = await sessions.create({
          projectId,
          ...options.create,
        });
        sessionId = session.id;
        connectUrl =
          session.connectUrl
          ?? (await sessions.debug?.(session.id))?.wsUrl
          ?? "";
      }
      if (!connectUrl) {
        throw new Error("Browserbase session missing connectUrl / debug.wsUrl");
      }

      const computer = await PlaywrightComputer.connect(connectUrl, display);
      const createdHere = !options.sessionId;

      const runtime: ComputerRuntime<{ sessionId: string; computer: PlaywrightComputer }> = {
        id: sessionId,
        raw: { sessionId, computer },
        capabilities: browserbaseCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          return runPlaywrightAction(computer, "browserbase", action);
        },
        screenshot: () => computer.screenshot(),
        async stop() {
          await computer.stop();
          if (createdHere) {
            await bb.sessions
              .update(sessionId!, { projectId, status: "REQUEST_RELEASE" })
              .catch(() => undefined);
          }
        },
      };
      return runtime;
    },
  };
}
