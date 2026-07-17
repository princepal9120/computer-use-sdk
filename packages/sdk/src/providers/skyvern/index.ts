import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ToolAction, ToolResult } from "../../core/types";
import { requireEnv } from "../../internal/provider-utils";
import { skyvernCapabilities } from "../capabilities";

export interface SkyvernOptions {
  apiKey?: string;
  baseUrl?: string;
  /** Skyvern organization / x-api-key style auth also accepted. */
}

export { skyvernCapabilities };

/**
 * Skyvern — production vision browser agent (cloud REST).
 * Env: `SKYVERN_API_KEY`. No required peer (fetch).
 */
export function skyvern(options: SkyvernOptions = {}): ComputerProvider {
  return {
    id: "skyvern",
    capabilities: skyvernCapabilities,
    async create(createOptions) {
      const apiKey = requireEnv(
        "SKYVERN_API_KEY",
        options.apiKey ?? process.env.SKYVERN_API_KEY,
        "skyvern",
      );
      const baseUrl = (
        options.baseUrl
        ?? process.env.SKYVERN_BASE_URL
        ?? "https://api.skyvern.com"
      ).replace(/\/$/, "");

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      };

      const runtime: ComputerRuntime = {
        id: `skyvern-${crypto.randomUUID().slice(0, 8)}`,
        raw: { baseUrl },
        capabilities: skyvernCapabilities,
        display: createOptions.display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent" || action.type === "extract") {
            const body = {
              url: action.type === "extract" ? action.url : undefined,
              navigation_goal:
                action.type === "agent" ? action.task : `Extract: ${action.query}`,
              data_extraction_goal:
                action.type === "extract" ? action.query : undefined,
              max_steps: action.type === "agent" ? action.maxSteps ?? 25 : 10,
            };
            const res = await fetch(`${baseUrl}/api/v1/tasks`, {
              method: "POST",
              headers,
              body: JSON.stringify(body),
            });
            if (!res.ok) {
              throw new ComputerUseError({
                code: "driver_error",
                provider: "skyvern",
                operation: action.type,
                message: await res.text(),
              });
            }
            const data = await res.json();
            return { type: "json", data };
          }
          if (action.type === "goto") {
            const res = await fetch(`${baseUrl}/api/v1/tasks`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                url: action.url,
                navigation_goal: `Navigate to ${action.url}`,
              }),
            });
            return { type: "json", data: await res.json() };
          }
          return unsupported("skyvern", action.type);
        },
        async screenshot() {
          throw new ComputerUseError({
            code: "unsupported",
            provider: "skyvern",
            operation: "screenshot",
            message: "Use agent tasks; live screenshot is not exposed on this adapter",
          });
        },
        async stop() {},
      };
      return runtime;
    },
  };
}
