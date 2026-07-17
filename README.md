<p align="center">
  <strong>Computer Use SDK</strong>
</p>

<p align="center">
  One TypeScript API for computer-use, browser agents, desktops, and scrape.<br/>
  Plug any provider in — swap one import.
</p>

## Install

```bash
bun add @prince/computer-use-sdk
# install only the peers you plug in (see matrix)
```

## Quickstart

```ts
import { createSession } from "@prince/computer-use-sdk";
import { local } from "@prince/computer-use-sdk/local";

await using session = await createSession({ provider: local() });
await session.run({ type: "goto", url: "https://example.com" });
await session.screenshot();
```

## Provider matrix

### Cloud / model SDKs

| SDK | Browser | Desktop | API | Import |
| --- | --- | --- | --- | --- |
| **TryCUA** | ✅ | ✅ | ✅ | `@prince/computer-use-sdk/cua` |
| **OpenAI Computer Use** | ✅ | ✅ | ✅ | `.../openai` |
| **Anthropic Computer Use** | ✅ | ✅ | ✅ | `.../anthropic` |
| **Browserbase** | ✅ | ❌ | ✅ | `.../browserbase` |
| **Steel.dev** | ✅ | ❌ | ✅ | `.../steel` |
| **Hyperbrowser** | ✅ | ❌ | ✅ | `.../hyperbrowser` |

### OSS / agent frameworks

| Project | Open Source | Browser | Desktop | Vision | Import |
| --- | --- | --- | --- | --- | --- |
| **Browser Use** | ✅ | ✅ | ❌ | ✅ | `.../browser-use` |
| **Skyvern** | ✅ | ✅ | ❌ | ✅ | `.../skyvern` |
| **OpenHands** | ✅ | ✅ | Partial | ✅ | `.../openhands` |
| **Stagehand** | ✅ | ✅ | ❌ | AI-assisted | `.../stagehand` |
| **Steel Browser SDK** | Partial | ✅ | ❌ | AI infra | `.../steel` |
| **AgentQL** | Partial | ✅ | ❌ | DOM AI | `.../agentql` |
| **Midscene.js** | ✅ | ✅ | ❌ | ✅ | `.../midscene` |
| **Nanobrowser** | ✅ | ✅ | ❌ | ✅ | `.../nanobrowser` |
| **Playwright MCP** | ✅ | ✅ | ❌ | ❌ | `.../playwright-mcp` |

Also: **Local** (bundled Playwright) · **Firecrawl** (scrape API).

```ts
import { browserbase } from "@prince/computer-use-sdk/browserbase";
import { openai } from "@prince/computer-use-sdk/openai";
import { anthropic } from "@prince/computer-use-sdk/anthropic";
import { steel } from "@prince/computer-use-sdk/steel";
import { hyperbrowser } from "@prince/computer-use-sdk/hyperbrowser";
import { skyvern } from "@prince/computer-use-sdk/skyvern";
import { stagehand } from "@prince/computer-use-sdk/stagehand";
import { midscene } from "@prince/computer-use-sdk/midscene";
// …same createSession({ provider }) for all
```

Optional peers (install only what you use):

`openai` · `@anthropic-ai/sdk` · `@browserbasehq/sdk` · `steel-sdk` · `@hyperbrowser/sdk` · `browser-use-sdk` · `@trycua/computer` · `@browserbasehq/stagehand` · `agentql` · `@midscene/web` · `@mendable/firecrawl-js`

## Links

- Repo: https://github.com/princepal9120/computer-use-sdk
- Site: https://computer-use-sdk.vercel.app

## License

[MIT](./LICENSE)
