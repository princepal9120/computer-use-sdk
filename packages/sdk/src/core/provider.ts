import type {
  CapabilityMap,
  Display,
  ProviderName,
  ToolAction,
  ToolResult,
} from "./types";

export interface ProviderCreateOptions {
  display: Display;
  cwd?: string;
  env?: Readonly<Record<string, string>>;
  signal?: AbortSignal;
}

export interface ComputerRuntime<TRaw = unknown> {
  readonly id: string;
  readonly raw: TRaw;
  readonly capabilities: CapabilityMap;
  readonly display: Display;
  execute(action: ToolAction): Promise<ToolResult>;
  screenshot(): Promise<string>;
  stop(): Promise<void>;
}

export interface ComputerProvider<TRaw = unknown> {
  readonly id: ProviderName;
  readonly capabilities: CapabilityMap;
  create(options: ProviderCreateOptions): Promise<ComputerRuntime<TRaw>>;
}
