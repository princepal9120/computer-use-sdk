import { chromium, type Browser, type Page } from "playwright";
import type {
  ComputerAction,
  Display,
  MouseButton,
  ToolResult,
} from "./types";

export interface PlaywrightLaunchOptions {
  display: Display;
  headless?: boolean;
  startUrl?: string;
}

/**
 * Shared Playwright engine. Local launches Chromium; Browserbase / Browser Use
 * connect over CDP when they expose a connect URL.
 */
export class PlaywrightComputer {
  private constructor(
    private readonly browser: Browser,
    private readonly page: Page,
    private readonly ownBrowser: boolean,
    readonly display: Display,
  ) {}

  static async launch(options: Display | PlaywrightLaunchOptions): Promise<PlaywrightComputer> {
    const display = "display" in options ? options.display : options;
    const headless = "headless" in options ? (options.headless ?? true) : true;
    const startUrl = "startUrl" in options ? options.startUrl : undefined;
    const browser = await chromium.launch({
      headless,
      args: ["--no-sandbox", `--window-size=${display.width},${display.height}`],
    });
    const computer = await this.withPage(browser, display, true);
    if (startUrl) await computer.goto(startUrl);
    return computer;
  }

  static async connect(cdpEndpoint: string, display: Display): Promise<PlaywrightComputer> {
    const browser = await chromium.connectOverCDP(cdpEndpoint);
    const context =
      browser.contexts()[0]
      ?? (await browser.newContext({
        viewport: { width: display.width, height: display.height },
        deviceScaleFactor: 1,
      }));
    const page = context.pages()[0] ?? (await context.newPage());
    await page.setViewportSize({ width: display.width, height: display.height });
    return new PlaywrightComputer(browser, page, false, display);
  }

  /** Attach to an already-open Playwright browser/page (Stagehand, Midscene, AgentQL). */
  static attach(
    browser: Browser,
    page: Page,
    display: Display,
    ownBrowser = false,
  ): PlaywrightComputer {
    return new PlaywrightComputer(browser, page, ownBrowser, display);
  }

  private static async withPage(
    browser: Browser,
    display: Display,
    ownBrowser: boolean,
  ): Promise<PlaywrightComputer> {
    const context = await browser.newContext({
      viewport: { width: display.width, height: display.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto("about:blank");
    return new PlaywrightComputer(browser, page, ownBrowser, display);
  }

  get currentPage(): Page {
    return this.page;
  }

  get currentBrowser(): Browser {
    return this.browser;
  }

  async screenshot(): Promise<string> {
    const buffer = await this.page.screenshot({ type: "png" });
    return buffer.toString("base64");
  }

  async execute(action: ComputerAction): Promise<ToolResult> {
    switch (action.type) {
      case "screenshot":
        return { type: "image", data: await this.screenshot(), mediaType: "image/png" };
      case "mouse_move":
        await this.page.mouse.move(action.coordinate[0], action.coordinate[1]);
        return {
          type: "text",
          text: `Moved mouse to (${action.coordinate[0]}, ${action.coordinate[1]})`,
        };
      case "left_click":
        await this.click(action.coordinate, "left");
        return { type: "text", text: "Left click" };
      case "right_click":
        await this.click(action.coordinate, "right");
        return { type: "text", text: "Right click" };
      case "middle_click":
        await this.click(action.coordinate, "middle");
        return { type: "text", text: "Middle click" };
      case "double_click":
        await this.click(action.coordinate, "left", 2);
        return { type: "text", text: "Double click" };
      case "triple_click":
        await this.click(action.coordinate, "left", 3);
        return { type: "text", text: "Triple click" };
      case "left_click_drag":
        await this.drag(action.startCoordinate ?? null, action.coordinate);
        return {
          type: "text",
          text: `Dragged to (${action.coordinate[0]}, ${action.coordinate[1]})`,
        };
      case "mouse_scroll":
        await this.page.mouse.move(action.coordinate[0], action.coordinate[1]);
        await this.page.mouse.wheel(
          0,
          (action.scrollDirection === "down" ? 1 : -1) * (action.scrollAmount ?? 1) * 100,
        );
        return { type: "text", text: `Scrolled ${action.scrollDirection}` };
      case "key":
        await this.page.keyboard.press(action.text);
        return { type: "text", text: `Pressed key: ${action.text}` };
    }
  }

  async goto(url: string): Promise<ToolResult> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    return { type: "text", text: `Navigated to ${url}` };
  }

  async clickTarget(options: {
    selector?: string;
    text?: string;
    coordinate?: [number, number];
  }): Promise<ToolResult> {
    if (options.coordinate) {
      await this.click(options.coordinate, "left");
      return {
        type: "text",
        text: `Clicked (${options.coordinate[0]}, ${options.coordinate[1]})`,
      };
    }
    if (options.selector) {
      await this.page.click(options.selector, { timeout: 15_000 });
      return { type: "text", text: `Clicked ${options.selector}` };
    }
    if (options.text) {
      await this.page.getByText(options.text, { exact: false }).first().click({ timeout: 15_000 });
      return { type: "text", text: `Clicked text "${options.text}"` };
    }
    throw new Error("click requires selector, text, or coordinate");
  }

  async typeText(text: string, selector?: string): Promise<ToolResult> {
    if (selector) {
      await this.page.fill(selector, text, { timeout: 15_000 });
      return { type: "text", text: `Typed into ${selector}` };
    }
    await this.page.keyboard.type(text);
    return { type: "text", text: "Typed text" };
  }

  async wait(options: { ms?: number; selector?: string }): Promise<ToolResult> {
    if (options.selector) {
      await this.page.waitForSelector(options.selector, { timeout: options.ms ?? 30_000 });
      return { type: "text", text: `Waited for ${options.selector}` };
    }
    await this.page.waitForTimeout(options.ms ?? 1000);
    return { type: "text", text: `Waited ${options.ms ?? 1000}ms` };
  }

  /**
   * Lightweight DOM extract without a vision model.
   * - CSS-like queries (`#id`, `.class`, `tag`, `[attr]`) return matched text.
   * - Free-text queries search the page body for matching lines + return title/body snippet.
   */
  async extract(query: string, url?: string): Promise<ToolResult> {
    if (url) await this.goto(url);
    const trimmed = query.trim();
    const first = trimmed[0] ?? "";
    const looksLikeSelector =
      (first === "#" || first === "." || first === "[" || first === "*" || /[a-zA-Z]/.test(first))
      && !trimmed.includes("?")
      && trimmed.length < 200;

    if (looksLikeSelector) {
      try {
        const locator = this.page.locator(trimmed);
        const count = await locator.count();
        if (count > 0) {
          const texts = (await locator.allTextContents()).map((t) => t.trim()).filter(Boolean);
          const html = count === 1 ? await locator.first().innerHTML().catch(() => undefined) : undefined;
          return {
            type: "json",
            data: { query: trimmed, count, texts, html },
          };
        }
      } catch {
        // fall through to text search
      }
    }

    const data = await this.page.evaluate((q) => {
      const title = document.title;
      const body = document.body?.innerText ?? "";
      const lines = body
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const lower = q.toLowerCase();
      const matches = lines.filter((l) => l.toLowerCase().includes(lower)).slice(0, 50);
      return {
        query: q,
        title,
        url: location.href,
        matches,
        bodyPreview: body.slice(0, 4000),
      };
    }, trimmed);

    return { type: "json", data };
  }

  private async click(
    coordinate: [number, number] | undefined,
    button: MouseButton,
    clickCount = 1,
  ) {
    if (coordinate) await this.page.mouse.move(coordinate[0], coordinate[1]);
    const x = coordinate?.[0] ?? 0;
    const y = coordinate?.[1] ?? 0;
    await this.page.mouse.click(x, y, { button, clickCount });
  }

  private async drag(from: [number, number] | null, to: [number, number]) {
    const start = from ?? [0, 0];
    await this.page.mouse.move(start[0], start[1]);
    await this.page.mouse.down();
    await this.page.mouse.move(to[0], to[1], { steps: 10 });
    await this.page.mouse.up();
  }

  async stop(): Promise<void> {
    if (this.ownBrowser) await this.browser.close();
    else {
      // CDP: leave remote browser; just disconnect
      await this.browser.close().catch(() => undefined);
    }
  }
}
