import { execFile } from "node:child_process";
import { resolve as resolvePath } from "node:path";
import { promisify } from "node:util";
import { runEditorAction } from "../../core/editor";
import { PlaywrightComputer } from "../../core/engine";
import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ComputerAction, Display, ToolAction, ToolResult } from "../../core/types";
import { isComputerActionType } from "../../internal/provider-utils";
import { localCapabilities } from "../capabilities";

const execFileAsync = promisify(execFile);

export interface LocalOptions {
  display?: Partial<Display>;
  cwd?: string;
  env?: Readonly<Record<string, string>>;
  shell?: string;
}

export { localCapabilities };

/** Runs computer-use against a local Playwright Chromium + host shell/editor. */
export function local(options: LocalOptions = {}): ComputerProvider<PlaywrightComputer> {
  return {
    id: "local",
    capabilities: localCapabilities,
    async create(createOptions) {
      const display = {
        width: options.display?.width ?? createOptions.display.width,
        height: options.display?.height ?? createOptions.display.height,
      };
      const cwd = options.cwd ?? createOptions.cwd ?? process.cwd();
      const env = { ...createOptions.env, ...options.env };
      const shell = options.shell ?? "/bin/bash";
      const computer = await PlaywrightComputer.launch(display);

      const runtime: ComputerRuntime<PlaywrightComputer> = {
        id: `local-${crypto.randomUUID().slice(0, 8)}`,
        raw: computer,
        capabilities: localCapabilities,
        display,
        async execute(action: ToolAction): Promise<ToolResult> {
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
            case "bash":
              return runBash(shell, cwd, env, action.command);
            case "view":
            case "create":
            case "str_replace":
            case "insert": {
              const result = await runEditorAction(action, (p) =>
                p.startsWith("/") ? p : resolvePath(cwd, p),
              );
              return { type: "text", text: result.output };
            }
            case "agent":
            case "scrape":
            case "crawl":
            case "map":
            case "search":
              return unsupported("local", action.type);
            default:
              return unsupported("local", (action as { type: string }).type);
          }
        },
        screenshot: () => computer.screenshot(),
        stop: () => computer.stop(),
      };
      return runtime;
    },
  };
}

async function runBash(
  shell: string,
  cwd: string,
  env: Record<string, string | undefined>,
  command: string,
): Promise<ToolResult> {
  try {
    const { stdout, stderr } = await execFileAsync(shell, ["-c", command], {
      cwd,
      env: { ...process.env, ...env } as NodeJS.ProcessEnv,
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      type: "text",
      text: `${stdout}${stderr ? `\n[stderr]\n${stderr}` : ""}`.trim() || "(no output)",
    };
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; message?: string };
    const out = `${e.stdout ?? ""}${e.stderr ? `\n[stderr]\n${e.stderr}` : ""}`.trim();
    throw new ComputerUseError({
      code: "driver_error",
      provider: "local",
      operation: "bash",
      message: out || e.message || "bash failed",
      cause: error,
    });
  }
}
