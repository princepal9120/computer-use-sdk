import { ComputerUseError } from "../core/errors";

export async function loadOptionalPeer<T>(
  packageName: string,
  importer: () => Promise<T>,
  provider: string,
): Promise<T> {
  try {
    return await importer();
  } catch {
    throw new ComputerUseError({
      code: "invalid_input",
      provider,
      operation: "import",
      message: `${packageName} is not installed. Add it as a dependency to use the ${provider} provider.`,
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
