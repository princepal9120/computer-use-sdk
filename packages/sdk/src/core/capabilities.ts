import { ComputerUseError } from "./errors";
import type { Capability, CapabilityMap, CapabilityMode, ComputerSession } from "./types";

export function defineCapabilities(
  values: Partial<Record<Capability, CapabilityMode>>,
): CapabilityMap {
  return new Proxy(values, {
    get(target, property) {
      return typeof property === "string" && property in target
        ? target[property as Capability]
        : false;
    },
  }) as CapabilityMap;
}

export function supports(
  session: Pick<ComputerSession, "capabilities">,
  capability: Capability,
): boolean {
  return session.capabilities[capability] !== false;
}

export function capabilityMode(
  session: Pick<ComputerSession, "capabilities">,
  capability: Capability,
): CapabilityMode | false {
  return session.capabilities[capability];
}

export function requireCapability(
  session: Pick<ComputerSession, "capabilities" | "provider">,
  capability: Capability,
): CapabilityMode {
  const mode = session.capabilities[capability];
  if (mode === false) {
    throw new ComputerUseError({
      code: "unsupported",
      provider: session.provider,
      operation: capability,
      message: `${session.provider} does not support ${capability}`,
    });
  }
  return mode;
}
