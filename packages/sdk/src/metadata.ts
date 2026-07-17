import {
  browserUseCapabilities,
  browserbaseCapabilities,
  cuaCapabilities,
  firecrawlCapabilities,
  localCapabilities,
} from "./providers/capabilities";
import type { CapabilityMap, ProviderName } from "./core/types";

export interface ProviderMetadata {
  id: ProviderName;
  displayName: string;
  officialUrl: string;
  packageName: string | null;
  capabilities: CapabilityMap;
  environmentVariables: readonly string[];
  technicalStatus: "supported" | "experimental";
  notes: string;
}

export const providers: readonly ProviderMetadata[] = [
  {
    id: "local",
    displayName: "Local (Playwright)",
    officialUrl: "https://playwright.dev",
    packageName: "playwright",
    capabilities: localCapabilities,
    environmentVariables: [],
    technicalStatus: "supported",
    notes: "Bundled. Launches Chromium on the host; shell/editor hit the host FS.",
  },
  {
    id: "browserbase",
    displayName: "Browserbase",
    officialUrl: "https://www.browserbase.com",
    packageName: "@browserbasehq/sdk",
    capabilities: browserbaseCapabilities,
    environmentVariables: ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"],
    technicalStatus: "supported",
    notes: "Hosted browser over CDP. Optional peer dependency.",
  },
  {
    id: "browser-use",
    displayName: "Browser Use",
    officialUrl: "https://browser-use.com",
    packageName: "browser-use-sdk",
    capabilities: browserUseCapabilities,
    environmentVariables: ["BROWSER_USE_API_KEY"],
    technicalStatus: "supported",
    notes: "Agent tasks + optional CDP computer control.",
  },
  {
    id: "cua",
    displayName: "CUA (trycua)",
    officialUrl: "https://www.cua.ai",
    packageName: "@trycua/computer",
    capabilities: cuaCapabilities,
    environmentVariables: ["CUA_API_KEY"],
    technicalStatus: "supported",
    notes: "Full desktop computer-use sandboxes (macOS/Linux/Windows).",
  },
  {
    id: "firecrawl",
    displayName: "Firecrawl",
    officialUrl: "https://www.firecrawl.dev",
    packageName: "@mendable/firecrawl-js",
    capabilities: firecrawlCapabilities,
    environmentVariables: ["FIRECRAWL_API_KEY"],
    technicalStatus: "supported",
    notes: "Scrape/crawl/map/search. Not a live computer — plug in for web data.",
  },
];
