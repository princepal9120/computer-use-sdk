import { describe, expect, test } from "bun:test";
import {
  ComputerUseError,
  createSession,
  defineCapabilities,
  isComputerUseError,
  normalizeError,
  providerNames,
  supports,
} from "../src/index";
import type { ComputerProvider, ComputerRuntime } from "../src/core/provider";
import { providerMatrix, providers } from "../src/metadata";
import { runConformance } from "../src/testing";

function mockProvider(): ComputerProvider<{ n: number }> {
  const capabilities = defineCapabilities({
    "computer.screenshot": "host",
    "shell.run": "host",
  });
  return {
    id: "local",
    capabilities,
    async create(options): Promise<ComputerRuntime<{ n: number }>> {
      return {
        id: "mock-1",
        raw: { n: 1 },
        capabilities,
        display: options.display,
        async execute(action) {
          if (action.type === "bash") {
            return { type: "text", text: "computer-use-sdk\n" };
          }
          if (action.type === "screenshot") {
            return { type: "image", data: "aGVsbG8=", mediaType: "image/png" };
          }
          throw new Error(`unsupported ${action.type}`);
        },
        async screenshot() {
          return "aGVsbG8=";
        },
        async stop() {},
      };
    },
  };
}

describe("core", () => {
  test("providerNames lists full matrix", () => {
    expect(providerNames.length).toBe(16);
    expect(providerNames).toContain("openai");
    expect(providerNames).toContain("anthropic");
    expect(providerNames).toContain("steel");
    expect(providerNames).toContain("hyperbrowser");
    expect(providerNames).toContain("skyvern");
    expect(providerNames).toContain("openhands");
    expect(providerNames).toContain("stagehand");
    expect(providerNames).toContain("agentql");
    expect(providerNames).toContain("midscene");
    expect(providerNames).toContain("nanobrowser");
    expect(providerNames).toContain("playwright-mcp");
  });

  test("metadata covers every provider", () => {
    expect(providers.map((p) => p.id).sort()).toEqual([...providerNames].sort());
  });

  test("matrix has browser/desktop/api columns", () => {
    const matrix = providerMatrix();
    expect(matrix.length).toBe(16);
    const openai = matrix.find((m) => m.id === "openai");
    expect(openai?.browser).toBe(true);
    expect(openai?.desktop).toBe(true);
    expect(openai?.api).toBe(true);
    const steel = matrix.find((m) => m.id === "steel");
    expect(steel?.browser).toBe(true);
    expect(steel?.desktop).toBe(false);
  });

  test("createSession + with dispose", async () => {
    await using session = await createSession({ provider: mockProvider() });
    expect(session.id).toBe("mock-1");
    expect(supports(session, "shell.run")).toBe(true);
    expect(supports(session, "scrape.page")).toBe(false);
    const shot = await session.screenshot();
    expect(shot).toBe("aGVsbG8=");
  });

  test("normalizeError maps auth", () => {
    const err = normalizeError("browserbase", "create", new Error("Invalid API key"));
    expect(isComputerUseError(err)).toBe(true);
    expect(err.code).toBe("authentication");
  });

  test("ComputerUseError redacts secrets", () => {
    const err = new ComputerUseError({
      code: "authentication",
      provider: "x",
      message: "token=supersecret123 failed",
    });
    expect(err.message).toContain("[REDACTED]");
    expect(err.message).not.toContain("supersecret123");
  });

  test("conformance on mock", async () => {
    await using session = await createSession({ provider: mockProvider() });
    const result = await runConformance({ session });
    expect(result.failed).toBe(0);
  });
});
