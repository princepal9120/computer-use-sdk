import { describe, expect, test } from "bun:test";
import { createSession } from "../src/index";
import { local } from "../src/providers/local";
import { browserbase } from "../src/providers/browserbase";
import { browserUse } from "../src/providers/browser-use";
import { cua } from "../src/providers/cua";
import { firecrawl } from "../src/providers/firecrawl";
import { openai } from "../src/providers/openai";
import { anthropic } from "../src/providers/anthropic";
import { steel } from "../src/providers/steel";
import { hyperbrowser } from "../src/providers/hyperbrowser";
import { skyvern } from "../src/providers/skyvern";
import { openhands } from "../src/providers/openhands";
import { stagehand } from "../src/providers/stagehand";
import { agentql } from "../src/providers/agentql";
import { midscene } from "../src/providers/midscene";
import { nanobrowser } from "../src/providers/nanobrowser";
import { playwrightMcp } from "../src/providers/playwright-mcp";

const factories = [
  ["local", local()],
  ["browserbase", browserbase({ apiKey: "x", projectId: "y" })],
  ["browser-use", browserUse({ apiKey: "x" })],
  ["cua", cua({ apiKey: "x" })],
  ["firecrawl", firecrawl({ apiKey: "x" })],
  ["openai", openai({ apiKey: "x" })],
  ["anthropic", anthropic({ apiKey: "x" })],
  ["steel", steel({ apiKey: "x" })],
  ["hyperbrowser", hyperbrowser({ apiKey: "x" })],
  ["skyvern", skyvern({ apiKey: "x" })],
  ["openhands", openhands({ apiKey: "x", baseUrl: "http://127.0.0.1:9" })],
  ["stagehand", stagehand({ env: "LOCAL" })],
  ["agentql", agentql({ apiKey: "x" })],
  ["midscene", midscene()],
  ["nanobrowser", nanobrowser({ fallbackLocal: true })],
  ["playwright-mcp", playwrightMcp()],
] as const;

describe("providers plug-in surface", () => {
  for (const [id, provider] of factories) {
    test(`${id} factory id matches`, () => {
      expect(provider.id).toBe(id);
      expect(provider.capabilities).toBeDefined();
    });
  }

  test("firecrawl create fails without API key", async () => {
    const prev = process.env.FIRECRAWL_API_KEY;
    delete process.env.FIRECRAWL_API_KEY;
    try {
      await expect(createSession({ provider: firecrawl() })).rejects.toMatchObject({
        code: "authentication",
      });
    } finally {
      if (prev !== undefined) process.env.FIRECRAWL_API_KEY = prev;
    }
  });

  test("openai create fails without key", async () => {
    const prev = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      await expect(createSession({ provider: openai() })).rejects.toMatchObject({
        code: "authentication",
      });
    } finally {
      if (prev !== undefined) process.env.OPENAI_API_KEY = prev;
    }
  });

  test("anthropic create fails without key", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      await expect(createSession({ provider: anthropic() })).rejects.toMatchObject({
        code: "authentication",
      });
    } finally {
      if (prev !== undefined) process.env.ANTHROPIC_API_KEY = prev;
    }
  });

  test("steel create fails without key", async () => {
    const prev = process.env.STEEL_API_KEY;
    delete process.env.STEEL_API_KEY;
    try {
      await expect(createSession({ provider: steel() })).rejects.toMatchObject({
        code: "authentication",
      });
    } finally {
      if (prev !== undefined) process.env.STEEL_API_KEY = prev;
    }
  });

  test("skyvern create fails without key", async () => {
    const prev = process.env.SKYVERN_API_KEY;
    delete process.env.SKYVERN_API_KEY;
    try {
      await expect(createSession({ provider: skyvern() })).rejects.toMatchObject({
        code: "authentication",
      });
    } finally {
      if (prev !== undefined) process.env.SKYVERN_API_KEY = prev;
    }
  });
});
