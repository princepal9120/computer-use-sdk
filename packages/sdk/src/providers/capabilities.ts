import { defineCapabilities } from "../core/capabilities";

const browserComputer = {
  "computer.screenshot": "browser",
  "computer.mouse": "browser",
  "computer.key": "browser",
  "computer.scroll": "browser",
  "computer.drag": "browser",
  "browse.goto": "browser",
  "browse.click": "browser",
  "browse.type": "browser",
  "browse.wait": "browser",
  "display.configurable": "full",
  "surface.browser": "full",
  "surface.api": "api",
} as const;

export const localCapabilities = defineCapabilities({
  ...browserComputer,
  "computer.screenshot": "host",
  "computer.mouse": "host",
  "computer.key": "host",
  "computer.scroll": "host",
  "computer.drag": "host",
  "shell.run": "host",
  "editor.view": "host",
  "editor.create": "host",
  "editor.str_replace": "host",
  "editor.insert": "host",
  "surface.desktop": "partial",
});

export const browserbaseCapabilities = defineCapabilities({
  ...browserComputer,
  "session.resume": "cloud",
});

export const browserUseCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "vision.model": "vision",
  "session.resume": "cloud",
});

export const cuaCapabilities = defineCapabilities({
  "computer.screenshot": "desktop",
  "computer.mouse": "desktop",
  "computer.key": "desktop",
  "computer.scroll": "desktop",
  "computer.drag": "desktop",
  "shell.run": "desktop",
  "display.configurable": "full",
  "session.resume": "cloud",
  "surface.browser": "partial",
  "surface.desktop": "full",
  "surface.api": "api",
});

export const firecrawlCapabilities = defineCapabilities({
  "scrape.page": "cloud",
  "scrape.crawl": "cloud",
  "scrape.map": "cloud",
  "scrape.search": "cloud",
  "surface.api": "api",
});

/** OpenAI Computer Use — model loop + browser/desktop env. */
export const openaiCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "vision.model": "vision",
  "shell.run": "host",
  "surface.desktop": "full",
  "surface.api": "api",
});

/** Anthropic Computer Use — model loop + browser/desktop env. */
export const anthropicCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "vision.model": "vision",
  "shell.run": "host",
  "editor.view": "host",
  "editor.create": "host",
  "editor.str_replace": "host",
  "editor.insert": "host",
  "surface.desktop": "full",
  "surface.api": "api",
});

export const steelCapabilities = defineCapabilities({
  ...browserComputer,
  "session.resume": "cloud",
});

export const hyperbrowserCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "session.resume": "cloud",
});

export const skyvernCapabilities = defineCapabilities({
  "browse.agent": "agent",
  "browse.goto": "browser",
  "browse.extract": "vision",
  "vision.model": "vision",
  "surface.browser": "full",
  "surface.api": "api",
  "session.resume": "cloud",
});

export const openhandsCapabilities = defineCapabilities({
  "browse.agent": "agent",
  "shell.run": "host",
  "editor.view": "host",
  "editor.create": "host",
  "editor.str_replace": "host",
  "surface.browser": "full",
  "surface.desktop": "partial",
  "surface.api": "api",
  "vision.model": "vision",
});

export const stagehandCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "browse.extract": "vision",
  "vision.model": "vision",
});

export const agentqlCapabilities = defineCapabilities({
  "browse.goto": "browser",
  "browse.click": "browser",
  "browse.type": "browser",
  "browse.extract": "vision",
  "vision.model": "vision",
  "surface.browser": "full",
  "surface.api": "api",
});

export const midsceneCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "browse.extract": "vision",
  "vision.model": "vision",
});

export const nanobrowserCapabilities = defineCapabilities({
  ...browserComputer,
  "browse.agent": "agent",
  "vision.model": "vision",
});

export const playwrightMcpCapabilities = defineCapabilities({
  ...browserComputer,
  "computer.screenshot": "host",
  "computer.mouse": "host",
  "computer.key": "host",
  "computer.scroll": "host",
  "computer.drag": "host",
  "surface.api": "api",
});
