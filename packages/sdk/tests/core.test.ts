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
import { providers } from "../src/metadata";
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
  test("providerNames lists all plug-ins", () => {
    expect(providerNames).toEqual([
      "local",
      "browserbase",
      "browser-use",
      "cua",
      "firecrawl",
    ]);
  });

  test("metadata covers every provider", () => {
    expect(providers.map((p) => p.id).sort()).toEqual([...providerNames].sort());
  });

  test("createSession + with dispose", async () => {
    await using session = await createSession({ provider: mockProvider() });
    expect(session.id).toBe("mock-1");
    expect(session.provider).toBe("local");
    expect(supports(session, "shell.run")).toBe(true);
    expect(supports(session, "scrape.page")).toBe(false);
    const shot = await session.screenshot();
    expect(shot).toBe("aGVsbG8=");
    const bash = await session.run({ type: "bash", command: "echo hi" });
    expect(bash.type).toBe("text");
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
    expect(result.passed).toBeGreaterThan(0);
  });
});
