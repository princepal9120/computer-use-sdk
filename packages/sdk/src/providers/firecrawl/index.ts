import { ComputerUseError, unsupported } from "../../core/errors";
import type { ComputerProvider, ComputerRuntime } from "../../core/provider";
import type { ToolAction, ToolResult } from "../../core/types";
import { loadOptionalPeer, requireEnv } from "../../internal/provider-utils";
import { firecrawlCapabilities } from "../capabilities";

export interface FirecrawlOptions {
  apiKey?: string;
  apiUrl?: string;
}

export { firecrawlCapabilities };

type FirecrawlClient = {
  scrape: (url: string, opts?: Record<string, unknown>) => Promise<unknown>;
  crawl: (url: string, opts?: Record<string, unknown>) => Promise<unknown>;
  map?: (url: string, opts?: Record<string, unknown>) => Promise<unknown>;
  search: (query: string, opts?: Record<string, unknown>) => Promise<unknown>;
};

/**
 * Firecrawl scrape / crawl / map / search.
 * Peer: `@mendable/firecrawl-js`. Env: `FIRECRAWL_API_KEY`.
 *
 * Computer mouse/keyboard are unsupported — this provider is the web-data
 * plug-in that sits next to full computer-use drivers.
 */
export function firecrawl(
  options: FirecrawlOptions = {},
): ComputerProvider<FirecrawlClient> {
  return {
    id: "firecrawl",
    capabilities: firecrawlCapabilities,
    async create(createOptions) {
      const apiKey = requireEnv(
        "FIRECRAWL_API_KEY",
        options.apiKey ?? process.env.FIRECRAWL_API_KEY,
        "firecrawl",
      );

      const mod = await loadOptionalPeer(
        "@mendable/firecrawl-js",
        () => import("@mendable/firecrawl-js"),
        "firecrawl",
      );
      const Firecrawl =
        (mod as { default?: new (o: { apiKey: string; apiUrl?: string }) => FirecrawlClient })
          .default
        ?? (mod as { Firecrawl?: new (o: { apiKey: string; apiUrl?: string }) => FirecrawlClient })
          .Firecrawl
        ?? (mod as { FirecrawlApp?: new (o: { apiKey: string; apiUrl?: string }) => FirecrawlClient })
          .FirecrawlApp;

      if (!Firecrawl) {
        throw new ComputerUseError({
          code: "invalid_input",
          provider: "firecrawl",
          operation: "import",
          message: "@mendable/firecrawl-js did not export Firecrawl",
        });
      }

      const client = new Firecrawl({
        apiKey,
        ...(options.apiUrl ? { apiUrl: options.apiUrl } : {}),
      });

      const runtime: ComputerRuntime<FirecrawlClient> = {
        id: `firecrawl-${crypto.randomUUID().slice(0, 8)}`,
        raw: client,
        capabilities: firecrawlCapabilities,
        display: createOptions.display,
        async execute(action: ToolAction): Promise<ToolResult> {
          switch (action.type) {
            case "scrape": {
              const data = await client.scrape(action.url, {
                formats: action.formats ?? ["markdown"],
              });
              return { type: "json", data };
            }
            case "crawl": {
              const data = await client.crawl(action.url, {
                limit: action.limit ?? 10,
              });
              return { type: "json", data };
            }
            case "map": {
              if (!client.map) return unsupported("firecrawl", "map");
              const data = await client.map(action.url);
              return { type: "json", data };
            }
            case "search": {
              const data = await client.search(action.query, {
                limit: action.limit ?? 5,
              });
              return { type: "json", data };
            }
            default:
              return unsupported("firecrawl", action.type);
          }
        },
        async screenshot() {
          throw new ComputerUseError({
            code: "unsupported",
            provider: "firecrawl",
            operation: "screenshot",
            message: "Firecrawl has no live display; use scrape with screenshot format",
          });
        },
        async stop() {
          // stateless HTTP client
        },
      };
      return runtime;
    },
  };
}
