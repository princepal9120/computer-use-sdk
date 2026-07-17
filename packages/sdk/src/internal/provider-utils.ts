import { ComputerUseError } from "../core/errors";

export async function loadOptionalPeer<T>(
  packageName: string,
  importer: () => Promise<T>,
  provider: string,
): Promise<T> {
  try {
    return await importer();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const code = (error as { code?: string })?.code;
    const moduleNotFound =
      code === "ERR_MODULE_NOT_FOUND" ||
      code === "MODULE_NOT_FOUND" ||
      /cannot find (module|package)|cannot resolve/i.test(detail);
    // Which module is actually missing — the peer itself, or one of ITS deps?
    const missing = detail.match(/(?:module|package)\s+["']([^"']+)["']/i)?.[1];
    const peerItself =
      !missing || missing === packageName || missing.startsWith(`${packageName}/`);

    let message: string;
    if (moduleNotFound && peerItself) {
      message = `${packageName} is not installed. Add it as a dependency to use the ${provider} provider.`;
    } else if (moduleNotFound && missing) {
      message = `${packageName} is installed but a required dependency is missing (${missing}). Install ${missing} to use the ${provider} provider.`;
    } else {
      message = `Failed to load ${packageName} for the ${provider} provider: ${detail}`;
    }

    throw new ComputerUseError({
      code: "invalid_input",
      provider,
      operation: "import",
      message,
      cause: error,
    });
  }
}

export function requireEnv(
  name: string,
  value: string | undefined,
  provider: string,
): string {
  if (!value) {
    throw new ComputerUseError({
      code: "authentication",
      provider,
      operation: "auth",
      message: `${name} is required for the ${provider} provider`,
    });
  }
  return value;
}

export function isComputerActionType(
  type: string,
): type is
  | "screenshot"
  | "mouse_move"
  | "left_click"
  | "left_click_drag"
  | "right_click"
  | "middle_click"
  | "double_click"
  | "triple_click"
  | "mouse_scroll"
  | "key" {
  return [
    "screenshot",
    "mouse_move",
    "left_click",
    "left_click_drag",
    "right_click",
    "middle_click",
    "double_click",
    "triple_click",
    "mouse_scroll",
    "key",
  ].includes(type);
}
