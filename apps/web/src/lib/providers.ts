export type DemoProvider = {
  id: string;
  name: string;
  monogram: string;
  factory: string;
  importFrom: string;
  config: string;
  run: string;
};

export const demoProviders: DemoProvider[] = [
  {
    id: "local",
    name: "Local",
    monogram: "LO",
    factory: "local",
    importFrom: "@prince/computer-use-sdk/local",
    config: "local()",
    run: 'await session.run({ type: "goto", url: "https://example.com" });\nawait session.screenshot();',
  },
  {
    id: "openai",
    name: "OpenAI",
    monogram: "OA",
    factory: "openai",
    importFrom: "@prince/computer-use-sdk/openai",
    config: 'openai({ apiKey: process.env.OPENAI_API_KEY! })',
    run: 'await session.run({ type: "agent", task: "Open example.com and list links" });',
  },
  {
    id: "anthropic",
    name: "Anthropic",
    monogram: "AN",
    factory: "anthropic",
    importFrom: "@prince/computer-use-sdk/anthropic",
    config: 'anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })',
    run: 'await session.run({ type: "agent", task: "Open example.com and list links" });',
  },
  {
    id: "cua",
    name: "TryCUA",
    monogram: "CU",
    factory: "cua",
    importFrom: "@prince/computer-use-sdk/cua",
    config: 'cua({ apiKey: process.env.CUA_API_KEY! })',
    run: 'await session.run({ type: "agent", task: "Open example.com and list links" });',
  },
  {
    id: "browserbase",
    name: "Browserbase",
    monogram: "BB",
    factory: "browserbase",
    importFrom: "@prince/computer-use-sdk/browserbase",
    config: 'browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! })',
    run: 'await session.run({ type: "goto", url: "https://example.com" });',
  },
  {
    id: "steel",
    name: "Steel.dev",
    monogram: "ST",
    factory: "steel",
    importFrom: "@prince/computer-use-sdk/steel",
    config: 'steel({ apiKey: process.env.STEEL_API_KEY! })',
    run: 'await session.run({ type: "goto", url: "https://example.com" });',
  },
];

export const stripProviders = [
  { name: "Local", monogram: "LO" },
  { name: "OpenAI", monogram: "OA" },
  { name: "Anthropic", monogram: "AN" },
  { name: "TryCUA", monogram: "CU" },
  { name: "Browserbase", monogram: "BB" },
  { name: "Steel.dev", monogram: "ST" },
  { name: "Hyperbrowser", monogram: "HB" },
  { name: "Browser Use", monogram: "BU" },
  { name: "Skyvern", monogram: "SV" },
  { name: "Stagehand", monogram: "SH" },
  { name: "Midscene.js", monogram: "MI" },
  { name: "Playwright MCP", monogram: "PW" },
];

export type Cap = "yes" | "no" | "partial";

export type MatrixRow = {
  name: string;
  monogram: string;
  browser: Cap;
  desktop: Cap;
  api: Cap;
  vision: Cap;
  oss: Cap;
  pkg: string;
  group: "cloud" | "oss" | "transport";
  note?: string;
};

const Y: Cap = "yes";
const N: Cap = "no";
const P: Cap = "partial";

export const matrix: MatrixRow[] = [
  { name: "TryCUA", monogram: "CU", browser: Y, desktop: Y, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/cua", group: "cloud" },
  { name: "OpenAI Computer Use", monogram: "OA", browser: Y, desktop: Y, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/openai", group: "cloud" },
  { name: "Anthropic Computer Use", monogram: "AN", browser: Y, desktop: Y, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/anthropic", group: "cloud" },
  { name: "Browserbase", monogram: "BB", browser: Y, desktop: N, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/browserbase", group: "cloud" },
  { name: "Steel.dev", monogram: "ST", browser: Y, desktop: N, api: Y, vision: P, oss: N, pkg: "@prince/computer-use-sdk/steel", group: "cloud" },
  { name: "Hyperbrowser", monogram: "HB", browser: Y, desktop: N, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/hyperbrowser", group: "cloud" },
  { name: "Browser Use", monogram: "BU", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/browser-use", group: "oss" },
  { name: "Skyvern", monogram: "SV", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/skyvern", group: "oss" },
  { name: "OpenHands", monogram: "OH", browser: Y, desktop: P, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/openhands", group: "oss" },
  { name: "Stagehand", monogram: "SH", browser: Y, desktop: N, vision: P, oss: Y, api: N, pkg: "@prince/computer-use-sdk/stagehand", group: "oss", note: "AI-assisted" },
  { name: "AgentQL", monogram: "AQ", browser: Y, desktop: N, vision: P, oss: P, api: N, pkg: "@prince/computer-use-sdk/agentql", group: "oss", note: "DOM AI" },
  { name: "Midscene.js", monogram: "MI", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/midscene", group: "oss" },
  { name: "Nanobrowser", monogram: "NB", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/nanobrowser", group: "oss" },
  { name: "Playwright MCP", monogram: "PW", browser: Y, desktop: N, vision: N, oss: Y, api: N, pkg: "@prince/computer-use-sdk/playwright-mcp", group: "oss" },
  { name: "Local", monogram: "LO", browser: Y, desktop: P, vision: N, oss: Y, api: N, pkg: "@prince/computer-use-sdk/local", group: "transport", note: "Bundled Playwright" },
  { name: "Firecrawl", monogram: "FC", browser: Y, desktop: N, vision: N, oss: N, api: Y, pkg: "@prince/computer-use-sdk/firecrawl", group: "transport", note: "Scrape add-on" },
];

export const peers = [
  "openai",
  "@anthropic-ai/sdk",
  "@browserbasehq/sdk",
  "steel-sdk",
  "@hyperbrowser/sdk",
  "browser-use-sdk",
  "@trycua/computer",
  "@browserbasehq/stagehand",
  "agentql",
  "@midscene/web",
  "@mendable/firecrawl-js",
];