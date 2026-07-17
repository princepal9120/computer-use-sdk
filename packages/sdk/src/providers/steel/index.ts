import type { ComputerProvider } from "../../core/provider";
import type { Display } from "../../core/types";
import { createCdpRuntime } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { steelCapabilities } from "../capabilities";

export interface SteelOptions {
  apiKey?: string;
  baseUrl?: string;
  display?: Partial<Display>;
  sessionId?: string;
  create?: Record<string, unknown>;
}

export { steelCapabilities };

/**
 * Steel.dev hosted browser (CDP). Peer: `steel-sdk`. Env: `STEEL_API_KEY`.
 */
export function steel(options: SteelOptions = {}): ComputerProvider {
  return {
    id: "steel",
    capabilities: steelCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "STEEL_API_KEY",
        options.apiKey ?? process.env.STEEL_API_KEY,
        "steel",
      );

      const mod = await loadOptionalPeer("steel-sdk", () => import("steel-sdk"), "steel");
      const Steel =
        (mod as unknown as { default?: new (o: Record<string, unknown>) => SteelClient }).default
        ?? (mod as unknown as { Steel?: new (o: Record<string, unknown>) => SteelClient }).Steel;
      if (!Steel) throw new Error("steel-sdk did not export client");

      const client = new Steel({
        steelAPIKey: apiKey,
        ...(options.baseUrl ? { baseURL: options.baseUrl } : {}),
      });

      let sessionId = options.sessionId;
      let connectUrl = "";
      let createdHere = false;

      if (sessionId) {
        const session = await client.sessions.retrieve(sessionId);
        connectUrl = pickConnectUrl(session);
      } else {
        const session = await client.sessions.create({
          ...options.create,
        });
        sessionId = String(session.id ?? session.sessionId ?? "");
        connectUrl = pickConnectUrl(session);
        createdHere = true;
      }
      if (!sessionId) throw new Error("Steel session missing id");

      return createCdpRuntime({
        provider: "steel",
        display,
        capabilities: steelCapabilities,
        session: {
          sessionId,
          connectUrl,
          stopRemote: createdHere
            ? async () => {
                await client.sessions.release(sessionId!).catch(() => undefined);
              }
            : undefined,
        },
      });
    },
  };
}

interface SteelClient {
  sessions: {
    create: (body?: Record<string, unknown>) => Promise<Record<string, unknown>>;
    retrieve: (id: string) => Promise<Record<string, unknown>>;
    release: (id: string) => Promise<unknown>;
  };
}

function pickConnectUrl(session: Record<string, unknown>): string {
  const url =
    (session.websocketUrl as string | undefined)
    ?? (session.wsUrl as string | undefined)
    ?? (session.connectUrl as string | undefined)
    ?? (session.cdpUrl as string | undefined)
    ?? ((session.debug as { wsUrl?: string } | undefined)?.wsUrl);
  if (!url) throw new Error("Steel session missing websocket/connect URL");
  return url;
}
