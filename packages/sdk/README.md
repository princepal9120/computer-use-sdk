# @opencoredev/computer-use-sdk

Unified computer-use session API. **16 providers** — plug in/out via subpath imports.

```ts
import { createSession } from "@opencoredev/computer-use-sdk";
import { anthropic } from "@opencoredev/computer-use-sdk/anthropic";

await using session = await createSession({ provider: anthropic() });
await session.run({ type: "agent", task: "Open example.com and summarize the hero" });
```

See root [README](../../README.md) for the full Browser / Desktop / API / Vision matrix.
