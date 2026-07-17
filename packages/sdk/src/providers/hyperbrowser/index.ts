import { ComputerUseError } from "../../core/errors";
import type { ComputerProvider } from "../../core/provider";
import type { Display, ToolResult } from "../../core/types";
import { createCdpRuntime } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { hyperbrowserCapabilities } from "../capabilities";

export interface HyperbrowserOptions {
  apiKey?: string;
  display?: Partial<Display>;
  sessionId?: string;
  create?: Record<string, unknown>;
}

export { hyperbrowserCapabilities };

/**
 * Hyperbrowser hosted browser + optional agent. Peer: `@hyperbrowser/sdk`.
 * Env: `HYPERBROWSER_API_KEY`.
 */
export function hyperbrowser(options: HyperbrowserOptions = {}): ComputerProvider {
  return {
    id: "hyperbrowser",
    capabilities: hyperbrowserCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "HYPERBROWSER_API_KEY",
        options.apiKey ?? process.env.HYPERBROWSER_API_KEY,
        "hyperbrowser",
      );

      const mod = await loadOptionalPeer(
        "@hyperbrowser/sdk",
        () => import("@hyperbrowser/sdk"),
        "hyperbrowser",
      );
      const Hyperbrowser =
        (mod as unknown as { Hyperbrowser: new (o: { apiKey: string }) => HbClient }).Hyperbrowser
        ?? (mod as unknown as { default: new (o: { apiKey: string }) => HbClient }).default;
      if (!Hyperbrowser) throw new Error("@hyperbrowser/sdk missing Hyperbrowser export");

      const client = new Hyperbrowser({ apiKey });
      let sessionId = options.sessionId;
      let connectUrl = "";
      let createdHere = false;

      if (sessionId) {
        const session = await client.sessions.get(sessionId);
        connectUrl = pickUrl(session);
      } else {
        const session = await client.sessions.create({
          ...options.create,
        });
        sessionId = String(session.id ?? session.sessionId);
        connectUrl = pickUrl(session);
        createdHere = true;
      }

      const agent = async (task: string, maxSteps?: number): Promise<ToolResult> => {
        // Real API (v0.91.x): client.agents.browserUse.startAndWait({ task, sessionId?, maxSteps? })
        // returns a BrowserUseTaskResponse whose final output lives at `data.finalResult`.
        const result = await client.agents.browserUse.startAndWait({
          task,
          sessionId,
          ...(maxSteps !== undefined ? { maxSteps } : {}),
        });
        if (result.error) {
          throw new ComputerUseError({
            code: "driver_error",
            provider: "hyperbrowser",
            operation: "agent",
            message: result.error,
          });
        }
        const finalResult = result.data?.finalResult;
        return {
          type: "text",
          text:
            finalResult
            ?? `Hyperbrowser agent finished with status: ${result.status}`,
        };
      };

      return createCdpRuntime({
        provider: "hyperbrowser",
        display,
        capabilities: hyperbrowserCapabilities,
        session: {
          sessionId: sessionId!,
          connectUrl,
          stopRemote: createdHere
            ? async () => {
                await client.sessions.stop(sessionId!).catch(() => undefined);
              }
            : undefined,
        },
        agent,
      });
    },
  };
}

/** Subset of @hyperbrowser/sdk's BrowserUseTaskResponse we consume. */
interface HbBrowserUseTaskResponse {
  jobId: string;
  status: string;
  data?: { finalResult: string | null } | null;
  error?: string | null;
  liveUrl?: string | null;
}

interface HbClient {
  sessions: {
    create: (body?: Record<string, unknown>) => Promise<Record<string, unknown>>;
    get: (id: string) => Promise<Record<string, unknown>>;
    stop: (id: string) => Promise<unknown>;
  };
  agents: {
    browserUse: {
      startAndWait: (params: {
        task: string;
        sessionId?: string;
        maxSteps?: number;
      }) => Promise<HbBrowserUseTaskResponse>;
    };
  };
}

function pickUrl(session: Record<string, unknown>): string {
  const url =
    (session.wsEndpoint as string | undefined)
    ?? (session.websocketUrl as string | undefined)
    ?? (session.connectUrl as string | undefined)
    ?? (session.cdpUrl as string | undefined);
  if (!url) throw new Error("Hyperbrowser session missing CDP/ws endpoint");
  return url;
}
