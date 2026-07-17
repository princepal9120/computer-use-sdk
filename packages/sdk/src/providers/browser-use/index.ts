import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { Display, ToolAction, ToolResult } from "../../core/types";
import {
  isComputerActionType,
  loadOptionalPeer,
  requireEnv,
} from "../../internal/provider-utils";
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
        const cdp =
          (session as { cdpUrl?: string | null }).cdpUrl
          ?? (session as { connectUrl?: string }).connectUrl;
        if (cdp && !options.agentOnly) {
          computer = await PlaywrightComputer.connect(cdp, display);
        }
      } else if (!options.agentOnly) {
        const session = await client.browsers.get(sessionId);
        const cdp =
          (session as { cdpUrl?: string | null }).cdpUrl
          ?? (session as { connectUrl?: string }).connectUrl;
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
            if (action.type === "goto" || action.type === "click" || action.type === "type") {
              // Fall back to agent for high-level browse without CDP
              return runAgentTask(
                client,
                describeBrowseAsTask(action),
              );
            }
            return unsupported("browser-use", `${action.type} (no CDP session)`);
          }
          if (isComputerActionType(action.type)) {
            return computer.execute(action as Extract<ToolAction, { type: typeof action.type }>);
          }
          switch (action.type) {
            case "goto":
              return computer.goto(action.url);
            case "click":
              return computer.clickTarget(action);
            case "type":
              return computer.typeText(action.text, action.selector);
            case "wait":
              return computer.wait(action);
            default:
              return unsupported("browser-use", action.type);
          }
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

interface BrowserUseClientLike {
  browsers: {
    create: (body?: Record<string, unknown>) => Promise<{ id: string; cdpUrl?: string | null }>;
    get: (id: string) => Promise<{ id: string; cdpUrl?: string | null }>;
    stop: (id: string) => Promise<unknown>;
  };
  tasks?: {
    createTask: (body: { task: string; maxSteps?: number }) => Promise<{ id: string }>;
    getTask: (id: string) => Promise<{ status: string; output?: string | null; error?: string | null }>;
  };
  run?: (task: string, opts?: { maxSteps?: number }) => Promise<{ output?: string }>;
}

async function runAgentTask(
  client: BrowserUseClientLike,
  task: string,
  maxSteps?: number,
): Promise<ToolResult> {
  // Prefer high-level run() when present (v2 SDK)
  if (typeof client.run === "function") {
    const result = await client.run(task, { maxSteps });
    return {
      type: "text",
      text: typeof result?.output === "string" ? result.output : JSON.stringify(result),
    };
  }
  if (client.tasks?.createTask) {
    const created = await client.tasks.createTask({ task, maxSteps });
    // Simple poll
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const status = await client.tasks.getTask(created.id);
      if (status.status === "finished" || status.status === "stopped") {
        return { type: "text", text: status.output ?? status.error ?? status.status };
      }
      if (status.status === "failed" || status.status === "error") {
        throw new ComputerUseError({
          code: "driver_error",
          provider: "browser-use",
          operation: "agent",
          message: status.error ?? "agent task failed",
        });
      }
    }
    throw new ComputerUseError({
      code: "timeout",
      provider: "browser-use",
      operation: "agent",
      message: "agent task timed out",
    });
  }
  throw new ComputerUseError({
    code: "unsupported",
    provider: "browser-use",
    operation: "agent",
    message: "browser-use-sdk has no run/tasks API in this version",
  });
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
