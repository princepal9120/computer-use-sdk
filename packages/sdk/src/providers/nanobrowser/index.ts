import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { requireEnv } from "../../internal/provider-utils";
import { nanobrowserCapabilities } from "../capabilities";

export interface NanobrowserOptions {
  /** CDP endpoint from Nanobrowser extension / bridge. */
  cdpUrl?: string;
  apiKey?: string;
  baseUrl?: string;
  display?: Partial<Display>;
  /** When no CDP, launch local Chromium (experimental fallback). */
  fallbackLocal?: boolean;
}

export { nanobrowserCapabilities };

/**
 * Nanobrowser — experimental agentic browser (CDP bridge or local fallback).
 * Env: `NANOBROWSER_CDP_URL` or `NANOBROWSER_API_KEY` + optional base URL.
 */
export function nanobrowser(options: NanobrowserOptions = {}): ComputerProvider {
  return {
    id: "nanobrowser",
    capabilities: nanobrowserCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const cdpUrl =
        options.cdpUrl
        ?? process.env.NANOBROWSER_CDP_URL
        ?? process.env.NANOBROWSER_WS_URL;
      const baseUrl = (
        options.baseUrl
        ?? process.env.NANOBROWSER_BASE_URL
        ?? ""
      ).replace(/\/$/, "");
      const apiKey = options.apiKey ?? process.env.NANOBROWSER_API_KEY;

      let computer: PlaywrightComputer | undefined;
      if (cdpUrl) {
        computer = await PlaywrightComputer.connect(cdpUrl, display);
      } else if (options.fallbackLocal !== false) {
        computer = await PlaywrightComputer.launch(display);
      } else {
        requireEnv("NANOBROWSER_CDP_URL", cdpUrl, "nanobrowser");
      }

      const runtime: ComputerRuntime = {
        id: `nanobrowser-${crypto.randomUUID().slice(0, 8)}`,
        raw: { computer, baseUrl },
        capabilities: nanobrowserCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent" && baseUrl) {
            const res = await fetch(`${baseUrl}/api/agent`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
              },
              body: JSON.stringify({ task: action.task, maxSteps: action.maxSteps }),
            });
            if (!res.ok) {
              throw new ComputerUseError({
                code: "driver_error",
                provider: "nanobrowser",
                operation: "agent",
                message: await res.text(),
              });
            }
            return { type: "json", data: await res.json() };
          }
          if (!computer) return unsupported("nanobrowser", action.type);
          if (action.type === "agent") {
            // experimental: navigate + screenshot only as stub when no remote agent
            return {
              type: "text",
              text: `Nanobrowser local mode has no remote agent. Task: ${action.task}. Set NANOBROWSER_BASE_URL or use CDP.`,
            };
          }
          return runPlaywrightAction(computer, "nanobrowser", action);
        },
        screenshot: () => {
          if (!computer) {
            throw new ComputerUseError({
              code: "unsupported",
              provider: "nanobrowser",
              operation: "screenshot",
              message: "No browser attached",
            });
          }
          return computer.screenshot();
        },
        async stop() {
          await computer?.stop();
        },
      };
      return runtime;
    },
  };
}
