import { ComputerUseError, normalizeError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ToolAction, ToolResult } from "../../core/types";
import { requireEnv } from "../../internal/provider-utils";
import { skyvernCapabilities } from "../capabilities";

export interface SkyvernOptions {
  apiKey?: string;
  baseUrl?: string;
  /**
   * URL Skyvern tasks start from. `/api/v1/tasks` requires a `url`, and the
   * `agent` action carries none, so it falls back to this (default:
   * `https://www.google.com`). `extract` uses its own `action.url` first.
   */
  url?: string;
  /** Poll interval while waiting for a task to reach a terminal status (ms). */
  pollIntervalMs?: number;
  /** Hard cap on how long to wait for a task to finish (ms). */
  timeoutMs?: number;
}

export { skyvernCapabilities };

const TERMINAL_STATUSES = new Set([
  "completed",
  "failed",
  "terminated",
  "canceled",
  "cancelled",
  "timed_out",
]);

const DEFAULT_URL = "https://www.google.com";
const DEFAULT_POLL_INTERVAL_MS = 2_000;
const DEFAULT_TIMEOUT_MS = 120_000;

interface SkyvernTask {
  task_id?: string;
  status?: string;
  extracted_information?: unknown;
  output?: unknown;
  failure_reason?: string | null;
  [key: string]: unknown;
}

/**
 * Skyvern — production vision browser agent (cloud REST).
 * Env: `SKYVERN_API_KEY`. No required peer (fetch).
 *
 * Tasks are asynchronous: create → poll `GET /api/v1/tasks/{id}` until a
 * terminal status, then return the completed task payload.
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
      const signal = createOptions.signal;
      const pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;

      const runtime: ComputerRuntime = {
        id: `skyvern-${crypto.randomUUID().slice(0, 8)}`,
        raw: { baseUrl },
        capabilities: skyvernCapabilities,
        display: createOptions.display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent" || action.type === "extract") {
            const isAgent = action.type === "agent";
            const url = isAgent
              ? options.url ?? DEFAULT_URL
              : action.url ?? options.url ?? DEFAULT_URL;
            const body = {
              url,
              navigation_goal: isAgent ? action.task : `Extract: ${action.query}`,
              data_extraction_goal: isAgent ? undefined : action.query,
              max_steps: isAgent ? action.maxSteps ?? 25 : 10,
            };
            const created = await postTask(baseUrl, headers, action.type, body, signal);
            const taskId = created.task_id;
            if (!taskId) {
              throw new ComputerUseError({
                code: "driver_error",
                provider: "skyvern",
                operation: action.type,
                message: `Skyvern did not return a task_id: ${JSON.stringify(created)}`,
              });
            }
            const timeoutMs = resolveTimeout(options, isAgent ? action.maxSteps : undefined);
            const task = await pollTask(baseUrl, headers, taskId, action.type, {
              signal,
              pollIntervalMs,
              timeoutMs,
            });
            return { type: "json", data: task };
          }
          if (action.type === "goto") {
            const created = await postTask(
              baseUrl,
              headers,
              "goto",
              { url: action.url, navigation_goal: `Navigate to ${action.url}` },
              signal,
            );
            return { type: "json", data: created };
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

async function postTask(
  baseUrl: string,
  headers: Record<string, string>,
  operation: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkyvernTask> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    throw normalizeError("skyvern", operation, error, "unavailable");
  }
  if (!res.ok) {
    throw new ComputerUseError({
      code: res.status === 401 || res.status === 403 ? "authentication" : "driver_error",
      provider: "skyvern",
      operation,
      message: `Skyvern task create failed (${res.status}): ${await res.text()}`,
    });
  }
  return (await res.json()) as SkyvernTask;
}

async function pollTask(
  baseUrl: string,
  headers: Record<string, string>,
  taskId: string,
  operation: string,
  opts: { signal?: AbortSignal; pollIntervalMs: number; timeoutMs: number },
): Promise<SkyvernTask> {
  const deadline = Date.now() + opts.timeoutMs;

  for (;;) {
    if (opts.signal?.aborted) {
      throw new ComputerUseError({
        code: "terminated",
        provider: "skyvern",
        operation,
        message: `Skyvern task ${taskId} aborted`,
      });
    }

    let res: Response;
    try {
      res = await fetch(`${baseUrl}/api/v1/tasks/${taskId}`, {
        method: "GET",
        headers,
        signal: opts.signal,
      });
    } catch (error) {
      throw normalizeError("skyvern", operation, error, "unavailable");
    }
    if (!res.ok) {
      throw new ComputerUseError({
        code: "driver_error",
        provider: "skyvern",
        operation,
        message: `Skyvern task poll failed (${res.status}): ${await res.text()}`,
      });
    }

    const task = (await res.json()) as SkyvernTask;
    const status = String(task.status ?? "").toLowerCase();
    if (TERMINAL_STATUSES.has(status)) {
      if (status === "failed" || status === "terminated" || status === "timed_out") {
        throw new ComputerUseError({
          code: status === "timed_out" ? "timeout" : "driver_error",
          provider: "skyvern",
          operation,
          message: `Skyvern task ${taskId} ${status}: ${task.failure_reason ?? "no reason provided"}`,
        });
      }
      return task;
    }

    if (Date.now() >= deadline) {
      throw new ComputerUseError({
        code: "timeout",
        provider: "skyvern",
        operation,
        message: `Skyvern task ${taskId} did not finish within ${opts.timeoutMs}ms (last status: ${status || "unknown"})`,
      });
    }

    await delay(opts.pollIntervalMs, opts.signal);
  }
}

function resolveTimeout(options: SkyvernOptions, maxSteps?: number): number {
  if (options.timeoutMs) return options.timeoutMs;
  if (maxSteps && maxSteps > 0) return Math.max(DEFAULT_TIMEOUT_MS, maxSteps * 10_000);
  return DEFAULT_TIMEOUT_MS;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(
        new ComputerUseError({
          code: "terminated",
          provider: "skyvern",
          operation: "poll",
          message: "Skyvern task aborted",
        }),
      );
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(
        new ComputerUseError({
          code: "terminated",
          provider: "skyvern",
          operation: "poll",
          message: "Skyvern task aborted",
        }),
      );
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
