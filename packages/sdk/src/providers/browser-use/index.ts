import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import { runPlaywrightAction } from "../../internal/cdp-runtime";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { browserUseCapabilities } from "../capabilities";

export interface BrowserUseOptions {
  apiKey?: string;
  display?: Partial<Display>;
  /** Existing Browser Use browser session id. */
  sessionId?: string;
  /** Prefer agent-only mode (no CDP computer control). */
  agentOnly?: boolean;
}

export { browserUseCapabilities };

type BrowserUseRaw = {
  sessionId: string;
  computer?: PlaywrightComputer;
  client: { browsers: { stop: (id: string) => Promise<unknown> }; tasks?: unknown };
};

/**
 * Browser Use Cloud — agent tasks + optional CDP computer control.
 * Peer: `browser-use-sdk`. Env: `BROWSER_USE_API_KEY`.
 */
export function browserUse(
  options: BrowserUseOptions = {},
): ComputerProvider<BrowserUseRaw> {
  return {
    id: "browser-use",
    capabilities: browserUseCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const apiKey = requireEnv(
        "BROWSER_USE_API_KEY",
        options.apiKey ?? process.env.BROWSER_USE_API_KEY,
        "browser-use",
      );

      const mod = await loadOptionalPeer(
        "browser-use-sdk",
        () => import("browser-use-sdk"),
        "browser-use",
      );
      // Default export path varies by major; support class on module root.
      const BrowserUseClient =
        (mod as unknown as { BrowserUse?: new (o: { apiKey: string }) => BrowserUseClientLike })
          .BrowserUse
        ?? (mod as unknown as { default?: new (o: { apiKey: string }) => BrowserUseClientLike })
          .default;
      if (!BrowserUseClient) {
        throw new ComputerUseError({
          code: "invalid_input",
          provider: "browser-use",
          operation: "import",
          message: "browser-use-sdk did not export BrowserUse",
        });
      }

      const client = new BrowserUseClient({ apiKey });
      let sessionId = options.sessionId;
      let computer: PlaywrightComputer | undefined;
      let createdHere = false;

      if (!sessionId) {
        const session = await client.browsers.create({
          browserScreenWidth: display.width,
          browserScreenHeight: display.height,
        });
        sessionId = session.id;
        createdHere = true;
        if (!options.agentOnly) {
          const cdp = await resolveCdpUrl(client, sessionId, session);
          if (cdp) computer = await PlaywrightComputer.connect(cdp, display);
        }
      } else if (!options.agentOnly) {
        const session = await client.browsers.get(sessionId);
        const cdp = await resolveCdpUrl(client, sessionId, session);
        if (cdp) computer = await PlaywrightComputer.connect(cdp, display);
      }

      const raw: BrowserUseRaw = { sessionId, computer, client };

      const runtime: ComputerRuntime<BrowserUseRaw> = {
        id: sessionId,
        raw,
        capabilities: browserUseCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
          if (action.type === "agent") {
            return runAgentTask(client, action.task, action.maxSteps);
          }
          if (!computer) {
            if (
              action.type === "goto"
              || action.type === "click"
              || action.type === "type"
              || action.type === "extract"
            ) {
              // Fall back to agent for high-level browse without CDP
              return runAgentTask(client, describeBrowseAsTask(action));
            }
            return unsupported("browser-use", `${action.type} (no CDP session)`);
          }
          return runPlaywrightAction(computer, "browser-use", action);
        },
        async screenshot() {
          if (computer) return computer.screenshot();
          throw new ComputerUseError({
            code: "unsupported",
            provider: "browser-use",
            operation: "screenshot",
            message: "No CDP session; use agent tasks or enable computer control",
          });
        },
        async stop() {
          await computer?.stop();
          if (createdHere) {
            await client.browsers.stop(sessionId!).catch(() => undefined);
          }
        },
      };
      return runtime;
    },
  };
}

type BrowserUseSession = {
  id: string;
  cdpUrl?: string | null;
  connectUrl?: string | null;
};

/** Awaited shape of `client.run()` (a `TaskRun<string>` resolving to a `TaskResult`). */
type BrowserUseRunResult = string | { output?: string | null } | null;

interface BrowserUseClientLike {
  browsers: {
    create: (body?: Record<string, unknown>) => Promise<BrowserUseSession>;
    get: (id: string) => Promise<BrowserUseSession>;
    stop: (id: string) => Promise<unknown>;
  };
  // v3 SDK: run(task, opts) returns a TaskRun<string> (a PromiseLike) that
  // awaits to a TaskResult ({ ...TaskView, output: string }).
  run?: (
    task: string,
    opts?: { maxSteps?: number },
  ) => PromiseLike<BrowserUseRunResult>;
}

function extractCdpUrl(session: BrowserUseSession): string | undefined {
  return session.cdpUrl ?? session.connectUrl ?? undefined;
}

/**
 * The CDP URL may not be provisioned by the time create()/get() returns.
 * Briefly poll the session until it appears so `computer` control can attach.
 */
async function resolveCdpUrl(
  client: BrowserUseClientLike,
  sessionId: string,
  initial: BrowserUseSession,
): Promise<string | undefined> {
  let cdp = extractCdpUrl(initial);
  for (let attempt = 0; attempt < 5 && !cdp; attempt++) {
    await new Promise((r) => setTimeout(r, 500));
    const refreshed = await client.browsers.get(sessionId);
    cdp = extractCdpUrl(refreshed);
  }
  return cdp;
}

async function runAgentTask(
  client: BrowserUseClientLike,
  task: string,
  maxSteps?: number,
): Promise<ToolResult> {
  if (typeof client.run !== "function") {
    throw new ComputerUseError({
      code: "unsupported",
      provider: "browser-use",
      operation: "agent",
      message: "browser-use-sdk has no run() API in this version",
    });
  }
  // Awaiting the TaskRun yields a TaskResult ({ ...TaskView, output: string }).
  // Some builds resolve to a plain string instead — handle both, and only
  // stringify genuinely non-string shapes (avoids quote-wrapping the answer).
  const result = await client.run(
    task,
    maxSteps !== undefined ? { maxSteps } : undefined,
  );
  const output = typeof result === "string" ? result : result?.output;
  return {
    type: "text",
    text: typeof output === "string" ? output : JSON.stringify(result),
  };
}

function describeBrowseAsTask(action: ToolAction): string {
  switch (action.type) {
    case "goto":
      return `Navigate to ${action.url}`;
    case "click":
      return `Click ${action.selector ?? action.text ?? "the target element"}`;
    case "type":
      return `Type ${JSON.stringify(action.text)}${action.selector ? ` into ${action.selector}` : ""}`;
    default:
      return JSON.stringify(action);
  }
}
