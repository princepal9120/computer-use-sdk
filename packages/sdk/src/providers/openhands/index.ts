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
      const customBase = options.baseUrl ?? process.env.OPENHANDS_BASE_URL;
      const baseUrl = (customBase ?? "https://app.all-hands.dev").replace(/\/$/, "");

      // The default (cloud) endpoint requires an API key. Fail here with a clear
      // auth error rather than letting a missing key surface later as a confusing
      // 401/404 from the agent call. A custom self-hosted baseUrl may run without
      // a key, so only enforce the key when targeting the default cloud host.
      if (!customBase) {
        requireEnv("OPENHANDS_API_KEY", apiKey, "openhands");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
        headers["X-API-Key"] = apiKey;
      }

      // Best-effort conversation creation. NOTE: these REST paths are UNVERIFIED
      // (no confirmed OpenHands cloud API contract) and may not match a given
      // deployment. We do not fail create() here — if the endpoint is wrong the
      // agent call below surfaces a single, clear, actionable error instead of a
      // confusing cascade.
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
                "OpenHands agent endpoint did not respond successfully. The REST paths used here are unverified and may not match your deployment. Set OPENHANDS_BASE_URL to your OpenHands server or cloud URL and OPENHANDS_API_KEY (or ALLHANDS_API_KEY), and confirm the API exposes conversation/message endpoints.",
            });
          }
          // `bash` and every other action are unverified against a real OpenHands
          // API and are not implemented here — fail clearly rather than POSTing to
          // a speculative endpoint and returning whatever it happens to reply with.
          return unsupported("openhands", action.type);
        },
        async screenshot(): Promise<string> {
          return unsupported("openhands", "screenshot");
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
