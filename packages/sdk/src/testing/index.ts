import type { Capability, ComputerSession, ToolAction } from "../core/types";

export interface ConformanceSubject {
  session: ComputerSession;
  /** Capabilities that must pass when claimed. */
  required?: readonly Capability[];
}

export interface ConformanceResult {
  passed: number;
  failed: number;
  skipped: number;
  cases: Array<{ name: string; status: "pass" | "fail" | "skip"; error?: string }>;
}

/**
 * Minimal offline conformance checks (no live browser).
 * Live provider suites can wrap this after createSession().
 */
export async function runConformance(subject: ConformanceSubject): Promise<ConformanceResult> {
  const cases: ConformanceResult["cases"] = [];
  const run = async (name: string, fn: () => Promise<void>, skip = false) => {
    if (skip) {
      cases.push({ name, status: "skip" });
      return;
    }
    try {
      await fn();
      cases.push({ name, status: "pass" });
    } catch (error) {
      cases.push({
        name,
        status: "fail",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  await run("has provider id", async () => {
    if (!subject.session.provider) throw new Error("missing provider");
  });

  await run("capabilities object", async () => {
    if (!subject.session.capabilities) throw new Error("missing capabilities");
  });

  await run("display positive", async () => {
    if (subject.session.display.width < 1 || subject.session.display.height < 1) {
      throw new Error("invalid display");
    }
  });

  const canShot = subject.session.capabilities["computer.screenshot"] !== false;
  await run(
    "screenshot when supported",
    async () => {
      const data = await subject.session.screenshot();
      if (!data || data.length < 8) throw new Error("empty screenshot");
    },
    !canShot,
  );

  const canBash = subject.session.capabilities["shell.run"] !== false;
  await run(
    "bash echo when supported",
    async () => {
      const result = await subject.session.run({
        type: "bash",
        command: "echo computer-use-sdk",
      } satisfies ToolAction);
      if (result.type !== "text" || !result.text.includes("computer-use-sdk")) {
        throw new Error(`unexpected: ${JSON.stringify(result)}`);
      }
    },
    !canBash,
  );

  const passed = cases.filter((c) => c.status === "pass").length;
  const failed = cases.filter((c) => c.status === "fail").length;
  const skipped = cases.filter((c) => c.status === "skip").length;
  return { passed, failed, skipped, cases };
}
