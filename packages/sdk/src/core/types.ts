export const providerNames = [
  "local",
  "browserbase",
  "browser-use",
  "cua",
  "firecrawl",
  "openai",
  "anthropic",
  "steel",
  "hyperbrowser",
  "skyvern",
  "openhands",
  "stagehand",
  "agentql",
  "midscene",
  "nanobrowser",
  "playwright-mcp",
] as const;
export type ProviderName = (typeof providerNames)[number];

export const capabilityNames = [
  "computer.screenshot",
  "computer.mouse",
  "computer.key",
  "computer.scroll",
  "computer.drag",
  "browse.goto",
  "browse.click",
  "browse.type",
  "browse.wait",
  "browse.agent",
  "browse.extract",
  "scrape.page",
  "scrape.crawl",
  "scrape.map",
  "scrape.search",
  "shell.run",
  "editor.view",
  "editor.create",
  "editor.str_replace",
  "editor.insert",
  "display.configurable",
  "session.resume",
  "vision.model",
  "surface.browser",
  "surface.desktop",
  "surface.api",
] as const;

export type Capability = (typeof capabilityNames)[number];
export type CapabilityMode =
  | "full"
  | "native"
  | "host"
  | "browser"
  | "desktop"
  | "cloud"
  | "agent"
  | "vision"
  | "api"
  | "partial"
  | "none";

export type CapabilityMap = Readonly<Record<Capability, false | CapabilityMode>>;

/** Anthropic-style computer tool actions. */
export type ComputerAction =
  | { type: "screenshot" }
  | { type: "mouse_move"; coordinate: [number, number] }
  | { type: "left_click"; coordinate?: [number, number] }
  | {
      type: "left_click_drag";
      coordinate: [number, number];
      startCoordinate?: [number, number];
    }
  | { type: "right_click"; coordinate?: [number, number] }
  | { type: "middle_click"; coordinate?: [number, number] }
  | { type: "double_click"; coordinate?: [number, number] }
  | { type: "triple_click"; coordinate?: [number, number] }
  | {
      type: "mouse_scroll";
      coordinate: [number, number];
      scrollDirection: "up" | "down";
      scrollAmount?: number;
    }
  | { type: "key"; text: string };

/** High-level browser actions (browser-use / stagehand / midscene style). */
export type BrowseAction =
  | { type: "goto"; url: string }
  | { type: "click"; selector?: string; text?: string; coordinate?: [number, number] }
  | { type: "type"; text: string; selector?: string }
  | { type: "wait"; ms?: number; selector?: string }
  | { type: "agent"; task: string; maxSteps?: number }
  | { type: "extract"; query: string; url?: string };

/** Firecrawl-style scrape/crawl/search. */
export type ScrapeAction =
  | { type: "scrape"; url: string; formats?: readonly string[] }
  | { type: "crawl"; url: string; limit?: number }
  | { type: "map"; url: string }
  | { type: "search"; query: string; limit?: number };

export type BashAction = {
  type: "bash";
  command: string;
  restart?: boolean;
};

export type TextEditorAction =
  | { type: "view"; path: string; viewRange?: [number, number] }
  | { type: "create"; path: string; fileText: string }
  | {
      type: "str_replace";
      path: string;
      oldStr: string;
      newStr: string;
      replaceAll?: boolean;
    }
  | { type: "insert"; path: string; insertLine: number; insertText: string };

export type ToolAction =
  | ComputerAction
  | BrowseAction
  | ScrapeAction
  | BashAction
  | TextEditorAction;

export type ToolResult =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mediaType: "image/png" }
  | { type: "json"; data: unknown };

export type MouseButton = "left" | "right" | "middle";

export interface Display {
  width: number;
  height: number;
}

export interface ComputerSession<TRaw = unknown> {
  readonly id: string;
  readonly provider: ProviderName;
  readonly capabilities: CapabilityMap;
  readonly display: Display;
  readonly raw: TRaw;
  /** Execute a normalized action. */
  run(action: ToolAction): Promise<ToolResult>;
  /** Capture current screen (when supported). */
  screenshot(): Promise<string>;
  /** Stop the provider runtime. Repeated calls share the same cleanup. */
  stop(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
