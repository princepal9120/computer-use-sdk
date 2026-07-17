import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/metadata.ts",
    "src/testing/index.ts",
    "src/providers/local/index.ts",
    "src/providers/browserbase/index.ts",
    "src/providers/browser-use/index.ts",
    "src/providers/cua/index.ts",
    "src/providers/firecrawl/index.ts",
  ],
  format: "esm",
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "playwright",
    "@browserbasehq/sdk",
    "browser-use-sdk",
    "@trycua/computer",
    "@mendable/firecrawl-js",
  ],
});
