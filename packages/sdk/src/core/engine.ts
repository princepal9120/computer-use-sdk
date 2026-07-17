import { chromium, type Browser, type Page } from "playwright";
import type {
  ComputerAction,
  Display,
  MouseButton,
  ToolResult,
} from "./types";

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

  static async launch(display: Display): Promise<PlaywrightComputer> {
    const browser = await chromium.launch({
      args: ["--no-sandbox", `--window-size=${display.width},${display.height}`],
    });
    return this.withPage(browser, display, true);
  }

  static async connect(cdpEndpoint: string, display: Display): Promise<PlaywrightComputer> {
    const browser = await chromium.connectOverCDP(cdpEndpoint);
    const context = browser.contexts()[0] ?? (await browser.newContext({
      viewport: { width: display.width, height: display.height },
      deviceScaleFactor: 1,
    }));
    const page = context.pages()[0] ?? (await context.newPage());
    await page.setViewportSize({ width: display.width, height: display.height });
    return new PlaywrightComputer(browser, page, false, display);
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
      return { type: "text", text: `Clicked (${options.coordinate[0]}, ${options.coordinate[1]})` };
    }
    if (options.selector) {
      await this.page.click(options.selector);
      return { type: "text", text: `Clicked ${options.selector}` };
    }
    if (options.text) {
      await this.page.getByText(options.text, { exact: false }).first().click();
      return { type: "text", text: `Clicked text "${options.text}"` };
    }
    throw new Error("click requires selector, text, or coordinate");
  }

  async typeText(text: string, selector?: string): Promise<ToolResult> {
    if (selector) {
      await this.page.fill(selector, text);
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

  private async click(
    coordinate: [number, number] | undefined,
    button: MouseButton,
    clickCount = 1,
  ) {
    if (coordinate) await this.page.mouse.move(coordinate[0], coordinate[1]);
    const pos = coordinate ?? (await this.page.evaluate(() => ({ x: 0, y: 0 })));
    const x = Array.isArray(coordinate) ? coordinate[0] : (pos as { x: number }).x;
    const y = Array.isArray(coordinate) ? coordinate[1] : (pos as { y: number }).y;
    await this.page.mouse.click(x, y, { button, clickCount });
  }

  private async drag(from: [number, number] | null, to: [number, number]) {
    let start = from;
    if (!start) {
      start = [0, 0];
    }
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
