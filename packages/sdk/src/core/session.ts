import { normalizeError, ComputerUseError } from "./errors";
import type { ComputerProvider } from "./provider";
import type { ComputerSession, Display, ToolAction, ToolResult } from "./types";

export interface CreateSessionOptions<TProvider extends ComputerProvider<unknown>> {
  provider: TProvider;
  display?: Partial<Display>;
  cwd?: string;
  env?: Readonly<Record<string, string>>;
  signal?: AbortSignal;
}

type RawOf<TProvider> = TProvider extends ComputerProvider<infer TRaw> ? TRaw : never;

/**
 * Creates a normalized computer-use session. Prefer `await using` so cleanup
 * runs when the scope exits.
 */
export async function createSession<TProvider extends ComputerProvider<unknown>>(
  options: CreateSessionOptions<TProvider>,
): Promise<ComputerSession<RawOf<TProvider>>> {
  const display: Display = {
    width: options.display?.width ?? 1280,
    height: options.display?.height ?? 800,
  };
  let runtime;
  try {
    runtime = await options.provider.create({
      display,
      cwd: options.cwd,
      env: options.env,
      signal: options.signal,
    });
  } catch (error) {
    throw normalizeError(options.provider.id, "session.create", error);
  }

  let stopPromise: Promise<void> | undefined;
  const stop = async () => {
    stopPromise ??= call("session.stop", () => runtime.stop());
    return stopPromise;
  };

  const call = async <T>(operation: string, fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      throw normalizeError(options.provider.id, operation, error);
    }
  };

  return {
    id: runtime.id,
    provider: options.provider.id,
    capabilities: runtime.capabilities,
    display: runtime.display,
    raw: runtime.raw as RawOf<TProvider>,
    run: (action: ToolAction): Promise<ToolResult> =>
      call(`execute.${action.type}`, () => runtime.execute(action)),
    screenshot: () => call("screenshot", () => runtime.screenshot()),
    stop,
    [Symbol.asyncDispose]: stop,
  };
}

/**
 * Runs a callback with a session and stops it afterward.
 * Prefer `await using` with `createSession()` when available.
 */
export async function withSession<TProvider extends ComputerProvider<unknown>, TResult>(
  options: CreateSessionOptions<TProvider>,
  callback: (session: ComputerSession<RawOf<TProvider>>) => TResult | Promise<TResult>,
): Promise<TResult> {
  const session = await createSession(options);
  try {
    const result = await callback(session);
    await session.stop();
    return result;
  } catch (error) {
    try {
      await session.stop();
    } catch (cleanupError) {
      if (error instanceof Error) {
        Object.defineProperty(error, "cleanupError", {
          value: cleanupError,
          enumerable: false,
        });
      }
    }
    throw error;
  }
}

export function assertDisplay(display: Display): Display {
  if (display.width < 1 || display.height < 1) {
    throw new ComputerUseError({
      code: "invalid_input",
      provider: "core",
      operation: "display",
      message: "display width and height must be positive",
    });
  }
  return display;
}
