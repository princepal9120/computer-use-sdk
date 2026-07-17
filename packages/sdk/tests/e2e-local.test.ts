import { describe, expect, test } from "bun:test";
import { createSession, supports } from "../src/index";
import { local } from "../src/providers/local";
import { playwrightMcp } from "../src/providers/playwright-mcp";
import { nanobrowser } from "../src/providers/nanobrowser";

/** Stable offline fixture — no network required. */
const FIXTURE = `data:text/html,${encodeURIComponent(`<!DOCTYPE html>
<html>
<head><title>CUSDK Fixture</title></head>
<body>
  <h1 id="title">Hello Computer Use</h1>
  <p class="lead">Browse and computer actions</p>
  <button id="btn" data-count="0">Click me</button>
  <input id="field" type="text" value="" placeholder="type here" />
  <div id="log"></div>
  <a href="#more" id="more-link">More information</a>
  <script>
    document.getElementById('btn').addEventListener('click', function () {
      var n = Number(this.getAttribute('data-count') || '0') + 1;
      this.setAttribute('data-count', String(n));
      document.getElementById('log').textContent = 'clicked-' + n;
    });
  </script>
</body>
</html>`)}`;

describe("e2e local browse + computer", () => {
  test(
    "full action matrix on fixture page",
    async () => {
      await using session = await createSession({
        provider: local({ headless: true, startUrl: FIXTURE }),
        display: { width: 900, height: 700 },
      });

      expect(session.provider).toBe("local");
      expect(supports(session, "browse.goto")).toBe(true);
      expect(supports(session, "computer.mouse")).toBe(true);
      expect(supports(session, "browse.extract")).toBe(true);
      expect(supports(session, "shell.run")).toBe(true);

      // browse.goto already via startUrl; re-navigate for explicit action
      const nav = await session.run({ type: "goto", url: FIXTURE });
      expect(nav.type).toBe("text");

      // computer.screenshot
      const shot = await session.screenshot();
      expect(shot.length).toBeGreaterThan(100);
      const shotAction = await session.run({ type: "screenshot" });
      expect(shotAction.type).toBe("image");

      // computer.mouse + clicks
      await session.run({ type: "mouse_move", coordinate: [20, 20] });
      await session.run({ type: "left_click", coordinate: [30, 30] });
      await session.run({ type: "right_click", coordinate: [40, 40] });
      await session.run({ type: "middle_click", coordinate: [50, 50] });
      await session.run({ type: "double_click", coordinate: [60, 60] });
      await session.run({ type: "triple_click", coordinate: [70, 70] });
      await session.run({
        type: "left_click_drag",
        startCoordinate: [10, 10],
        coordinate: [80, 80],
      });
      await session.run({
        type: "mouse_scroll",
        coordinate: [100, 100],
        scrollDirection: "down",
        scrollAmount: 1,
      });
      await session.run({ type: "key", text: "Tab" });

      // browse.click by selector
      const clickSel = await session.run({ type: "click", selector: "#btn" });
      expect(clickSel.type).toBe("text");

      // browse.click by text
      const clickText = await session.run({ type: "click", text: "More information" });
      expect(clickText.type).toBe("text");

      // browse.type into input
      const typed = await session.run({ type: "type", selector: "#field", text: "hello-sdk" });
      expect(typed.type).toBe("text");

      // browse.wait
      const waited = await session.run({ type: "wait", ms: 50 });
      expect(waited.type).toBe("text");
      const waitSel = await session.run({ type: "wait", selector: "#title", ms: 5000 });
      expect(waitSel.type).toBe("text");

      // browse.extract (CSS + free text)
      const extractCss = await session.run({ type: "extract", query: "#title" });
      expect(extractCss.type).toBe("json");
      if (extractCss.type === "json") {
        const data = extractCss.data as { texts?: string[] };
        expect(data.texts?.join(" ")).toContain("Hello Computer Use");
      }
      const extractText = await session.run({ type: "extract", query: "Browse and computer" });
      expect(extractText.type).toBe("json");
      if (extractText.type === "json") {
        const data = extractText.data as { title?: string; matches?: string[] };
        expect(data.title).toBe("CUSDK Fixture");
        expect((data.matches ?? []).length).toBeGreaterThan(0);
      }

      // shell + editor
      const bash = await session.run({ type: "bash", command: "echo e2e-matrix" });
      expect(bash.type).toBe("text");
      if (bash.type === "text") expect(bash.text).toContain("e2e-matrix");

      const path = `/tmp/cusdk-e2e-${Date.now()}.txt`;
      await session.run({ type: "create", path, fileText: "alpha\n" });
      const viewed = await session.run({ type: "view", path });
      expect(viewed.type).toBe("text");
      await session.run({
        type: "str_replace",
        path,
        oldStr: "alpha",
        newStr: "beta",
      });
      await session.run({ type: "insert", path, insertLine: 1, insertText: "gamma\n" });
      const finalView = await session.run({ type: "view", path });
      if (finalView.type === "text") {
        expect(finalView.text).toContain("beta");
        expect(finalView.text).toContain("gamma");
      }
    },
    60_000,
  );
});

describe("e2e playwright-mcp + nanobrowser fallback", () => {
  test(
    "playwright-mcp covers browse + computer + mcp tools",
    async () => {
      await using session = await createSession({
        provider: playwrightMcp({ headless: true, startUrl: FIXTURE }),
        display: { width: 800, height: 600 },
      });

      expect(session.provider).toBe("playwright-mcp");
      expect(supports(session, "browse.extract")).toBe(true);

      await session.run({ type: "click", selector: "#btn" });
      await session.run({ type: "type", selector: "#field", text: "mcp" });
      await session.run({ type: "mouse_move", coordinate: [12, 12] });
      await session.run({ type: "left_click", coordinate: [12, 12] });
      const extracted = await session.run({ type: "extract", query: "h1" });
      expect(extracted.type).toBe("json");

      const shot = await session.screenshot();
      expect(shot.length).toBeGreaterThan(100);

      // MCP bridge via raw + agent prefix
      const raw = session.raw as {
        callMcpTool: (
          name: string,
          args?: Record<string, unknown>,
        ) => Promise<{ type: string }>;
      };
      const mcpResult = await raw.callMcpTool("browser_navigate", { url: FIXTURE });
      expect(mcpResult.type).toBe("text");
      const viaAgent = await session.run({
        type: "agent",
        task: `mcp:browser_click ${JSON.stringify({ selector: "#btn" })}`,
      });
      expect(viaAgent.type).toBe("text");
    },
    60_000,
  );

  test(
    "nanobrowser local fallback supports full browse matrix",
    async () => {
      await using session = await createSession({
        provider: nanobrowser({ fallbackLocal: true, headless: true }),
        display: { width: 800, height: 600 },
      });

      await session.run({ type: "goto", url: FIXTURE });
      await session.run({ type: "click", selector: "#btn" });
      await session.run({ type: "type", selector: "#field", text: "nano" });
      await session.run({ type: "mouse_move", coordinate: [5, 5] });
      await session.run({ type: "left_click", coordinate: [5, 5] });
      const extracted = await session.run({ type: "extract", query: "#title" });
      expect(extracted.type).toBe("json");
      const shot = await session.screenshot();
      expect(shot.length).toBeGreaterThan(100);
    },
    60_000,
  );
});
