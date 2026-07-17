<p align="center">
  <strong>Computer Use SDK</strong>
</p>

<p align="center">
  One TypeScript API for computer-use, browser automation, and web scraping.<br/>
  Local · Browserbase · Browser Use · CUA · Firecrawl
</p>

Run the same agent computer code on a local Playwright browser, Browserbase, Browser Use Cloud, CUA desktops, or Firecrawl — plug providers in and out with one import change.

## Install

```bash
bun add @opencoredev/computer-use-sdk
```

Node.js 22 or 24. Bun 1.3+.

## Quickstart

```ts
import { createSession } from "@opencoredev/computer-use-sdk";
import { local } from "@opencoredev/computer-use-sdk/local";

await using session = await createSession({ provider: local() });
await session.run({ type: "goto", url: "https://example.com" });
console.log((await session.screenshot()).slice(0, 32));
```

## Providers

| Provider | Runtime | Best for |
| --- | --- | --- |
| [Local](./packages/sdk/README.md) | Playwright Chromium | Development, CI, shell + editor |
| [Browserbase](https://www.browserbase.com) | Hosted browser (CDP) | Scalable remote browsers |
| [Browser Use](https://browser-use.com) | Agent + stealth browser | Goal-oriented web agents |
| [CUA](https://www.cua.ai) | Full desktop sandbox | Desktop computer-use agents |
| [Firecrawl](https://www.firecrawl.dev) | Scrape / crawl API | Web data without a live UI |

Local is included. Cloud providers are **optional peer dependencies** — install only what you use.

```ts
// swap one line
import { browserbase } from "@opencoredev/computer-use-sdk/browserbase";
import { browserUse } from "@opencoredev/computer-use-sdk/browser-use";
import { cua } from "@opencoredev/computer-use-sdk/cua";
import { firecrawl } from "@opencoredev/computer-use-sdk/firecrawl";
```

## Env

| Provider | Variables |
| --- | --- |
| Browserbase | `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` |
| Browser Use | `BROWSER_USE_API_KEY` |
| CUA | `CUA_API_KEY` |
| Firecrawl | `FIRECRAWL_API_KEY` |

## Monorepo

```bash
bun install
bun run test
bun run build
```

- `packages/sdk` — `@opencoredev/computer-use-sdk`
- `apps/web` — docs / landing (Vercel)

## License

[MIT](./LICENSE) © OpenCore
