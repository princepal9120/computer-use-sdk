export type DemoProvider = {
  id: string;
  name: string;
  monogram: string;
  /** Brand domain — used for favicon (same treatment for every provider). */
  domain: string;
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
    domain: "playwright.dev",
    factory: "local",
    importFrom: "@prince/computer-use-sdk/local",
    config: "local()",
    run: '// Bundled Playwright. No API key, no extra installs.\nawait session.run({ type: "goto", url: "https://example.com" });\nconst screenshot = await session.screenshot();',
  },
  {
    id: "openai",
    name: "OpenAI",
    monogram: "OA",
    domain: "openai.com",
    factory: "openai",
    importFrom: "@prince/computer-use-sdk/openai",
    config: "openai({ apiKey: process.env.OPENAI_API_KEY! })",
    run: '// Hand the model a task; it drives the computer.\nawait session.run({\n  type: "agent",\n  task: "Open example.com and list every link",\n});',
  },
  {
    id: "anthropic",
    name: "Anthropic",
    monogram: "AN",
    domain: "anthropic.com",
    factory: "anthropic",
    importFrom: "@prince/computer-use-sdk/anthropic",
    config: "anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })",
    run: 'await session.run({\n  type: "agent",\n  task: "Search Hacker News for \\"computer use\\"",\n  maxSteps: 12,\n});',
  },
  {
    id: "cua",
    name: "TryCUA",
    monogram: "CU",
    domain: "cua.ai",
    factory: "cua",
    importFrom: "@prince/computer-use-sdk/cua",
    config: "cua({ apiKey: process.env.CUA_API_KEY! })",
    run: '// Full desktop sandbox, same session.run.\nawait session.run({\n  type: "agent",\n  task: "Open the calculator and compute 12 × 7",\n});',
  },
  {
    id: "browserbase",
    name: "Browserbase",
    monogram: "BB",
    domain: "browserbase.com",
    factory: "browserbase",
    importFrom: "@prince/computer-use-sdk/browserbase",
    config: "browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! })",
    run: '// Cloud browser over CDP. Drive it like a local one.\nawait session.run({ type: "goto", url: "https://example.com" });\nawait session.run({ type: "click", text: "Sign in" });\nconst screenshot = await session.screenshot();',
  },
  {
    id: "steel",
    name: "Steel.dev",
    monogram: "ST",
    domain: "steel.dev",
    factory: "steel",
    importFrom: "@prince/computer-use-sdk/steel",
    config: "steel({ apiKey: process.env.STEEL_API_KEY! })",
    run: 'await session.run({ type: "goto", url: "https://news.ycombinator.com" });\nconst result = await session.run({\n  type: "extract",\n  query: ".titleline",\n});',
  },
  {
    id: "hyperbrowser",
    name: "Hyperbrowser",
    monogram: "HB",
    domain: "hyperbrowser.ai",
    factory: "hyperbrowser",
    importFrom: "@prince/computer-use-sdk/hyperbrowser",
    config: "hyperbrowser({ apiKey: process.env.HYPERBROWSER_API_KEY! })",
    run: 'await session.run({ type: "goto", url: "https://example.com" });\nawait session.run({ type: "click", text: "Docs" });',
  },
  {
    id: "browser-use",
    name: "Browser Use",
    monogram: "BU",
    domain: "browser-use.com",
    factory: "browserUse",
    importFrom: "@prince/computer-use-sdk/browser-use",
    config: "browserUse({ apiKey: process.env.BROWSER_USE_API_KEY! })",
    run: 'await session.run({\n  type: "agent",\n  task: "Find the pricing page and extract plan names",\n});',
  },
  {
    id: "skyvern",
    name: "Skyvern",
    monogram: "SV",
    domain: "skyvern.com",
    factory: "skyvern",
    importFrom: "@prince/computer-use-sdk/skyvern",
    config: "skyvern({ apiKey: process.env.SKYVERN_API_KEY! })",
    run: 'await session.run({\n  type: "agent",\n  task: "Log in and download the latest invoice",\n});',
  },
  {
    id: "openhands",
    name: "OpenHands",
    monogram: "OH",
    domain: "all-hands.dev",
    factory: "openhands",
    importFrom: "@prince/computer-use-sdk/openhands",
    config: "openhands({ apiKey: process.env.OPENHANDS_API_KEY! })",
    run: 'await session.run({\n  type: "agent",\n  task: "Clone the repo and run the test suite",\n});',
  },
  {
    id: "stagehand",
    name: "Stagehand",
    monogram: "SH",
    domain: "docs.stagehand.dev",
    factory: "stagehand",
    importFrom: "@prince/computer-use-sdk/stagehand",
    config: "stagehand({ apiKey: process.env.BROWSERBASE_API_KEY! })",
    run: 'await session.run({ type: "goto", url: "https://example.com" });\nconst data = await session.run({\n  type: "extract",\n  query: "main heading and CTA text",\n});',
  },
  {
    id: "agentql",
    name: "AgentQL",
    monogram: "AQ",
    domain: "agentql.com",
    factory: "agentql",
    importFrom: "@prince/computer-use-sdk/agentql",
    config: "agentql({ apiKey: process.env.AGENTQL_API_KEY! })",
    run: 'await session.run({ type: "goto", url: "https://news.ycombinator.com" });\nconst titles = await session.run({\n  type: "extract",\n  query: "top story titles",\n});',
  },
  {
    id: "midscene",
    name: "Midscene.js",
    monogram: "MI",
    domain: "midscenejs.com",
    factory: "midscene",
    importFrom: "@prince/computer-use-sdk/midscene",
    config: "midscene()",
    run: 'await session.run({ type: "goto", url: "https://example.com" });\nawait session.run({\n  type: "agent",\n  task: "Click the primary button in the hero",\n});',
  },
  {
    id: "nanobrowser",
    name: "Nanobrowser",
    monogram: "NB",
    domain: "nanobrowser.ai",
    factory: "nanobrowser",
    importFrom: "@prince/computer-use-sdk/nanobrowser",
    config: "nanobrowser({ cdpUrl: process.env.NANOBROWSER_CDP_URL! })",
    run: 'await session.run({ type: "goto", url: "https://example.com" });\nconst shot = await session.screenshot();',
  },
  {
    id: "playwright-mcp",
    name: "Playwright MCP",
    monogram: "PW",
    domain: "playwright.dev",
    factory: "playwrightMcp",
    importFrom: "@prince/computer-use-sdk/playwright-mcp",
    config: "playwrightMcp()",
    run: 'await session.run({ type: "goto", url: "https://example.com" });\nawait session.run({ type: "click", text: "Get started" });\nconst screenshot = await session.screenshot();',
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    monogram: "FC",
    domain: "firecrawl.dev",
    factory: "firecrawl",
    importFrom: "@prince/computer-use-sdk/firecrawl",
    config: "firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY! })",
    run: '// Scrape add-on: web data, not live UI control.\nconst page = await session.run({\n  type: "scrape",\n  url: "https://example.com",\n});',
  },
];

export type StripProvider = {
  name: string;
  monogram: string;
  /** Brand domain — every logo uses the same favicon treatment. */
  domain: string;
};

/** All providers for the auto-scrolling logo strip (mirrors matrix). */
export const stripProviders: StripProvider[] = [
  { name: "Local", monogram: "LO", domain: "playwright.dev" },
  { name: "OpenAI", monogram: "OA", domain: "openai.com" },
  { name: "Anthropic", monogram: "AN", domain: "anthropic.com" },
  { name: "TryCUA", monogram: "CU", domain: "cua.ai" },
  { name: "Browserbase", monogram: "BB", domain: "browserbase.com" },
  { name: "Steel.dev", monogram: "ST", domain: "steel.dev" },
  { name: "Hyperbrowser", monogram: "HB", domain: "hyperbrowser.ai" },
  { name: "Browser Use", monogram: "BU", domain: "browser-use.com" },
  { name: "Skyvern", monogram: "SV", domain: "skyvern.com" },
  { name: "OpenHands", monogram: "OH", domain: "all-hands.dev" },
  { name: "Stagehand", monogram: "SH", domain: "docs.stagehand.dev" },
  { name: "AgentQL", monogram: "AQ", domain: "agentql.com" },
  { name: "Midscene.js", monogram: "MI", domain: "midscenejs.com" },
  { name: "Nanobrowser", monogram: "NB", domain: "nanobrowser.ai" },
  { name: "Playwright MCP", monogram: "PW", domain: "playwright.dev" },
  { name: "Firecrawl", monogram: "FC", domain: "firecrawl.dev" },
];

export type Cap = "yes" | "no" | "partial";

export type MatrixRow = {
  name: string;
  monogram: string;
  domain: string;
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
  { name: "TryCUA", monogram: "CU", domain: "cua.ai", browser: Y, desktop: Y, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/cua", group: "cloud" },
  { name: "OpenAI Computer Use", monogram: "OA", domain: "openai.com", browser: Y, desktop: Y, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/openai", group: "cloud" },
  { name: "Anthropic Computer Use", monogram: "AN", domain: "anthropic.com", browser: Y, desktop: Y, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/anthropic", group: "cloud" },
  { name: "Browserbase", monogram: "BB", domain: "browserbase.com", browser: Y, desktop: N, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/browserbase", group: "cloud" },
  { name: "Steel.dev", monogram: "ST", domain: "steel.dev", browser: Y, desktop: N, api: Y, vision: P, oss: N, pkg: "@prince/computer-use-sdk/steel", group: "cloud" },
  { name: "Hyperbrowser", monogram: "HB", domain: "hyperbrowser.ai", browser: Y, desktop: N, api: Y, vision: Y, oss: N, pkg: "@prince/computer-use-sdk/hyperbrowser", group: "cloud" },
  { name: "Browser Use", monogram: "BU", domain: "browser-use.com", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/browser-use", group: "oss" },
  { name: "Skyvern", monogram: "SV", domain: "skyvern.com", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/skyvern", group: "oss" },
  { name: "OpenHands", monogram: "OH", domain: "all-hands.dev", browser: Y, desktop: P, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/openhands", group: "oss" },
  { name: "Stagehand", monogram: "SH", domain: "docs.stagehand.dev", browser: Y, desktop: N, vision: P, oss: Y, api: N, pkg: "@prince/computer-use-sdk/stagehand", group: "oss", note: "AI-assisted" },
  { name: "AgentQL", monogram: "AQ", domain: "agentql.com", browser: Y, desktop: N, vision: P, oss: P, api: N, pkg: "@prince/computer-use-sdk/agentql", group: "oss", note: "DOM AI" },
  { name: "Midscene.js", monogram: "MI", domain: "midscenejs.com", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/midscene", group: "oss" },
  { name: "Nanobrowser", monogram: "NB", domain: "nanobrowser.ai", browser: Y, desktop: N, vision: Y, oss: Y, api: N, pkg: "@prince/computer-use-sdk/nanobrowser", group: "oss" },
  { name: "Playwright MCP", monogram: "PW", domain: "playwright.dev", browser: Y, desktop: N, vision: N, oss: Y, api: N, pkg: "@prince/computer-use-sdk/playwright-mcp", group: "oss" },
  { name: "Local", monogram: "LO", domain: "playwright.dev", browser: Y, desktop: P, vision: N, oss: Y, api: N, pkg: "@prince/computer-use-sdk/local", group: "transport", note: "Bundled Playwright" },
  { name: "Firecrawl", monogram: "FC", domain: "firecrawl.dev", browser: Y, desktop: N, vision: N, oss: N, api: Y, pkg: "@prince/computer-use-sdk/firecrawl", group: "transport", note: "Scrape add-on" },
];

export type PeerPkg = {
  name: string;
  for: string;
};

export const peers: PeerPkg[] = [
  { name: "openai", for: "OpenAI" },
  { name: "@anthropic-ai/sdk", for: "Anthropic" },
  { name: "@browserbasehq/sdk", for: "Browserbase" },
  { name: "steel-sdk", for: "Steel.dev" },
  { name: "@hyperbrowser/sdk", for: "Hyperbrowser" },
  { name: "browser-use-sdk", for: "Browser Use" },
  { name: "@trycua/computer", for: "TryCUA" },
  { name: "@browserbasehq/stagehand", for: "Stagehand" },
  { name: "agentql", for: "AgentQL" },
  { name: "@midscene/web", for: "Midscene.js" },
  { name: "@mendable/firecrawl-js", for: "Firecrawl" },
];

/** Capability labels for matrix cards (only "yes" / partial shown). */
export function matrixCaps(row: MatrixRow): string[] {
  const out: string[] = [];
  if (row.browser === "yes") out.push("Browser");
  if (row.desktop === "yes") out.push("Desktop");
  else if (row.desktop === "partial") out.push("Desktop*");
  if (row.api === "yes") out.push("API");
  if (row.vision === "yes") out.push("Vision");
  else if (row.vision === "partial") out.push("Vision*");
  if (row.oss === "yes") out.push("OSS");
  else if (row.oss === "partial") out.push("OSS*");
  if (row.note) out.push(row.note);
  return out;
}

