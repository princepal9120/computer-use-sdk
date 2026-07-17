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
        if (!client.agents?.start) {
          return { type: "text", text: `Hyperbrowser agent unavailable; task: ${task}` };
        }
        const run = await client.agents.start({
          task,
          sessionId,
          maxSteps,
        });
        return { type: "json", data: run };
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

interface HbClient {
  sessions: {
    create: (body?: Record<string, unknown>) => Promise<Record<string, unknown>>;
    get: (id: string) => Promise<Record<string, unknown>>;
    stop: (id: string) => Promise<unknown>;
  };
  agents?: {
    start: (body: Record<string, unknown>) => Promise<unknown>;
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
