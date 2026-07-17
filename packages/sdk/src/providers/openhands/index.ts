import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ToolAction, ToolResult } from "../../core/types";
import { requireEnv } from "../../internal/provider-utils";
import { openhandsCapabilities } from "../capabilities";

export interface OpenHandsOptions {
  /** OpenHands / All Hands API key or local token. */
  apiKey?: string;
  baseUrl?: string;
}

export { openhandsCapabilities };

/**
 * OpenHands agent runtime (cloud or self-hosted HTTP API).
 * Env: `OPENHANDS_API_KEY`, optional `OPENHANDS_BASE_URL` (default api.all-hands.dev).
 */
export function openhands(options: OpenHandsOptions = {}): ComputerProvider {
  return {
    id: "openhands",
    capabilities: openhandsCapabilities,
    async create(createOptions) {
      const apiKey =
        options.apiKey
        ?? process.env.OPENHANDS_API_KEY
        ?? process.env.ALLHANDS_API_KEY;
      const baseUrl = (
        options.baseUrl
        ?? process.env.OPENHANDS_BASE_URL
        ?? "https://app.all-hands.dev"
      ).replace(/\/$/, "");

      if (!apiKey && !options.baseUrl && !process.env.OPENHANDS_BASE_URL) {
        requireEnv("OPENHANDS_API_KEY", apiKey, "openhands");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
        headers["X-API-Key"] = apiKey;
      }

      // Create or attach conversation/session when API supports it
      let conversationId = `local-${crypto.randomUUID().slice(0, 8)}`;
      try {
        const res = await fetch(`${baseUrl}/api/conversations`, {
          method: "POST",
          headers,
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = (await res.json()) as { conversation_id?: string; id?: string };
          conversationId = data.conversation_id ?? data.id ?? conversationId;
        }
      } catch {
        // self-hosted variants differ; agent actions still try HTTP paths
      }

      const runtime: ComputerRuntime = {
        id: conversationId,
        raw: { baseUrl, conversationId },
        capabilities: openhandsCapabilities,
        display: createOptions.display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent") {
            const res = await fetch(`${baseUrl}/api/conversations/${conversationId}/message`, {
              method: "POST",
              headers,
              body: JSON.stringify({ message: action.task, content: action.task }),
            }).catch(() => null);

            if (res?.ok) {
              return { type: "json", data: await res.json() };
            }

            // Alternate endpoint used by some deployments
            const alt = await fetch(`${baseUrl}/api/v1/chat`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                message: action.task,
                conversation_id: conversationId,
              }),
            }).catch(() => null);
            if (alt?.ok) return { type: "json", data: await alt.json() };

            throw new ComputerUseError({
              code: "unavailable",
              provider: "openhands",
              operation: "agent",
              message:
                "OpenHands endpoint unreachable. Set OPENHANDS_BASE_URL to your server (or cloud URL) and OPENHANDS_API_KEY.",
            });
          }
          if (action.type === "bash") {
            const res = await fetch(`${baseUrl}/api/conversations/${conversationId}/command`, {
              method: "POST",
              headers,
              body: JSON.stringify({ command: action.command }),
            });
            if (!res.ok) return unsupported("openhands", "bash");
            return { type: "json", data: await res.json() };
          }
          return unsupported("openhands", action.type);
        },
        async screenshot() {
          throw new ComputerUseError({
            code: "unsupported",
            provider: "openhands",
            operation: "screenshot",
            message: "Use agent tasks against OpenHands runtime",
          });
        },
        async stop() {
          await fetch(`${baseUrl}/api/conversations/${conversationId}`, {
            method: "DELETE",
            headers,
          }).catch(() => undefined);
        },
      };
      return runtime;
    },
  };
}
