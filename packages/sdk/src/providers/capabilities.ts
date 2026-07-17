import { defineCapabilities } from "../core/capabilities";

export const localCapabilities = defineCapabilities({
  "computer.screenshot": "host",
  "computer.mouse": "host",
  "computer.key": "host",
  "computer.scroll": "host",
  "computer.drag": "host",
  "browse.goto": "browser",
  "browse.click": "browser",
  "browse.type": "browser",
  "browse.wait": "browser",
  "shell.run": "host",
  "editor.view": "host",
  "editor.create": "host",
  "editor.str_replace": "host",
  "editor.insert": "host",
  "display.configurable": "full",
});

export const browserbaseCapabilities = defineCapabilities({
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
  "session.resume": "cloud",
});

export const browserUseCapabilities = defineCapabilities({
  "computer.screenshot": "browser",
  "computer.mouse": "browser",
  "computer.key": "browser",
  "computer.scroll": "browser",
  "computer.drag": "browser",
  "browse.goto": "browser",
  "browse.click": "browser",
  "browse.type": "browser",
  "browse.wait": "browser",
  "browse.agent": "agent",
  "display.configurable": "full",
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
});

export const firecrawlCapabilities = defineCapabilities({
  "scrape.page": "cloud",
  "scrape.crawl": "cloud",
  "scrape.map": "cloud",
  "scrape.search": "cloud",
});
