# @opencoredev/computer-use-sdk

One TypeScript API for **computer-use**, **browser automation**, and **web scraping**.

Swap providers by changing the import — same `createSession` / `session.run` surface.

| Provider | Import | Best for |
| --- | --- | --- |
| Local (Playwright) | `@opencoredev/computer-use-sdk/local` | Dev, CI, full mouse/keyboard + shell |
| Browserbase | `.../browserbase` | Hosted browsers over CDP |
| Browser Use | `.../browser-use` | Agent tasks + stealth browsers |
| CUA (trycua) | `.../cua` | Full desktop sandboxes |
| Firecrawl | `.../firecrawl` | Scrape / crawl / map / search |

## Install

```bash
bun add @opencoredev/computer-use-sdk
# optional peers — only install what you plug in
bun add @browserbasehq/sdk          # browserbase
bun add browser-use-sdk             # browser-use
bun add @trycua/computer            # cua
bun add @mendable/firecrawl-js      # firecrawl
```

## Quickstart

```ts
import { createSession } from "@opencoredev/computer-use-sdk";
import { local } from "@opencoredev/computer-use-sdk/local";

await using session = await createSession({ provider: local() });

await session.run({ type: "goto", url: "https://example.com" });
const shot = await session.screenshot(); // base64 PNG
await session.run({ type: "bash", command: "node --version" });
```

`await using` stops the provider when the scope exits.

## Plug in / plug out

```ts
import { createSession } from "@opencoredev/computer-use-sdk";
import { browserbase } from "@opencoredev/computer-use-sdk/browserbase";
// import { browserUse } from "@opencoredev/computer-use-sdk/browser-use";
// import { cua } from "@opencoredev/computer-use-sdk/cua";
// import { firecrawl } from "@opencoredev/computer-use-sdk/firecrawl";

await using session = await createSession({
  provider: browserbase(), // only this line changes
});
```

Cloud providers read env vars (`BROWSERBASE_*`, `BROWSER_USE_API_KEY`, `CUA_API_KEY`, `FIRECRAWL_API_KEY`). Pass options to override.

## Actions

**Computer** (Anthropic-style): `screenshot`, `mouse_move`, `left_click`, `key`, `mouse_scroll`, …

**Browse**: `goto`, `click`, `type`, `wait`, `agent` (Browser Use)

**Scrape** (Firecrawl): `scrape`, `crawl`, `map`, `search`

**Host** (Local / CUA): `bash`, text editor `view` / `create` / `str_replace` / `insert`

Each provider declares capabilities; unsupported actions throw `ComputerUseError` with code `unsupported`.

## License

MIT © OpenCore
