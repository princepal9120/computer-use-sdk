import { PlaywrightComputer } from "../core/engine";
import { unsupported } from "../core/errors";
import type { ComputerRuntime } from "../core/provider";
import type {
  CapabilityMap,
  ComputerAction,
  Display,
  ProviderName,
  ToolAction,
  ToolResult,
} from "../core/types";
import { isComputerActionType } from "./provider-utils";

export interface CdpSessionHandles {
  sessionId: string;
  connectUrl: string;
  stopRemote?: () => Promise<void>;
}

/** Shared CDP + Playwright runtime for Browserbase-class providers. */
export async function createCdpRuntime(options: {
  provider: ProviderName;
  display: Display;
  capabilities: CapabilityMap;
  session: CdpSessionHandles;
  agent?: (task: string, maxSteps?: number) => Promise<ToolResult>;
}): Promise<ComputerRuntime<{ sessionId: string; computer: PlaywrightComputer }>> {
  const computer = await PlaywrightComputer.connect(options.session.connectUrl, options.display);

  return {
    id: options.session.sessionId,
    raw: { sessionId: options.session.sessionId, computer },
    capabilities: options.capabilities,
    display: options.display,
    async execute(action: ToolAction): Promise<ToolResult> {
      if (action.type === "agent") {
        if (!options.agent) return unsupported(options.provider, "agent");
        return options.agent(action.task, action.maxSteps);
      }
      return runPlaywrightAction(computer, options.provider, action);
    },
    screenshot: () => computer.screenshot(),
    async stop() {
      await computer.stop();
      await options.session.stopRemote?.();
    },
  };
}

/**
 * Execute the full computer + browse action set against a PlaywrightComputer.
 * Used by local, CDP, openai/anthropic envs, playwright-mcp, nanobrowser, etc.
 */
export async function runPlaywrightAction(
  computer: PlaywrightComputer,
  provider: ProviderName,
  action: ToolAction,
): Promise<ToolResult> {
  if (isComputerActionType(action.type)) {
    return computer.execute(action as ComputerAction);
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
    case "extract":
      return computer.extract(action.query, action.url);
    default:
      return unsupported(provider, action.type);
  }
}
