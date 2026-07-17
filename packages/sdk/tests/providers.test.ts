import { describe, expect, test } from "bun:test";
import { createSession } from "../src/index";
import { local } from "../src/providers/local";
import { browserbase } from "../src/providers/browserbase";
import { browserUse } from "../src/providers/browser-use";
import { cua } from "../src/providers/cua";
import { firecrawl } from "../src/providers/firecrawl";
import {
  browserUseCapabilities,
  browserbaseCapabilities,
  cuaCapabilities,
  firecrawlCapabilities,
  localCapabilities,
} from "../src/providers/capabilities";

describe("providers plug-in surface", () => {
  test("local factory id + capabilities", () => {
    const p = local();
    expect(p.id).toBe("local");
    expect(p.capabilities).toBe(localCapabilities);
    expect(p.capabilities["shell.run"]).toBe("host");
  });

  test("browserbase factory", () => {
    const p = browserbase({ apiKey: "x", projectId: "y" });
    expect(p.id).toBe("browserbase");
    expect(p.capabilities).toBe(browserbaseCapabilities);
  });

  test("browser-use factory", () => {
    const p = browserUse({ apiKey: "x" });
    expect(p.id).toBe("browser-use");
    expect(p.capabilities).toBe(browserUseCapabilities);
    expect(p.capabilities["browse.agent"]).toBe("agent");
  });

  test("cua factory", () => {
    const p = cua({ apiKey: "x" });
    expect(p.id).toBe("cua");
    expect(p.capabilities).toBe(cuaCapabilities);
  });

  test("firecrawl factory", () => {
    const p = firecrawl({ apiKey: "x" });
    expect(p.id).toBe("firecrawl");
    expect(p.capabilities).toBe(firecrawlCapabilities);
    expect(p.capabilities["scrape.page"]).toBe("cloud");
    expect(p.capabilities["computer.screenshot"]).toBe(false);
  });

  test("firecrawl create fails without API key", async () => {
    const prev = process.env.FIRECRAWL_API_KEY;
    delete process.env.FIRECRAWL_API_KEY;
    try {
      await expect(
        createSession({ provider: firecrawl() }),
      ).rejects.toMatchObject({ code: "authentication" });
    } finally {
      if (prev !== undefined) process.env.FIRECRAWL_API_KEY = prev;
    }
  });

  test("browserbase create fails without keys", async () => {
    const a = process.env.BROWSERBASE_API_KEY;
    const b = process.env.BROWSERBASE_PROJECT_ID;
    delete process.env.BROWSERBASE_API_KEY;
    delete process.env.BROWSERBASE_PROJECT_ID;
    try {
      await expect(
        createSession({ provider: browserbase() }),
      ).rejects.toMatchObject({ code: "authentication" });
    } finally {
      if (a !== undefined) process.env.BROWSERBASE_API_KEY = a;
      if (b !== undefined) process.env.BROWSERBASE_PROJECT_ID = b;
    }
  });
});
