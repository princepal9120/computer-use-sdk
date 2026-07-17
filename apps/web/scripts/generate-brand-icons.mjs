import { createRequire } from "node:module";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const repoRoot = join(root, "..", "..");
const require = createRequire(join(repoRoot, "packages/sdk/package.json"));
const { chromium } = require("playwright");

const publicDir = join(root, "public");
const brandDir = join(publicDir, "brand");
mkdirSync(brandDir, { recursive: true });

const svg = readFileSync(join(brandDir, "mark.svg"), "utf8");

function scaleSvg(source, size) {
  return source
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`);
}

function pngToIco(pngBuf) {
  const width = pngBuf.readUInt32BE(16);
  const height = pngBuf.readUInt32BE(20);
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = width >= 256 ? 0 : width;
  entry[1] = height >= 256 ? 0 : height;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, pngBuf]);
}

async function render(size) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<!doctype html><html><body style="margin:0;background:transparent">${scaleSvg(svg, size)}</body></html>`,
    { waitUntil: "load" },
  );
  const buf = await page.locator("svg").screenshot({
    type: "png",
    omitBackground: true,
  });
  await browser.close();
  return Buffer.from(buf);
}

const png32 = await render(32);
const png180 = await render(180);
const png256 = await render(256);

const appDir = join(root, "src", "app");
const ico = pngToIco(png32);

// public/ — served at site root
writeFileSync(join(publicDir, "favicon.ico"), ico);
writeFileSync(join(publicDir, "icon.png"), png32);
writeFileSync(join(brandDir, "icon-32.png"), png32);
writeFileSync(join(brandDir, "apple-touch-icon.png"), png180);
writeFileSync(join(brandDir, "mark.png"), png256);

// app/ — Next.js metadata file conventions (same brand mark)
writeFileSync(join(appDir, "favicon.ico"), ico);
writeFileSync(join(appDir, "icon.png"), png32);
writeFileSync(join(appDir, "apple-icon.png"), png180);

console.log("Generated brand icons (nav / favicon / apple — same mark):", {
  favicon: "public/favicon.ico + src/app/favicon.ico",
  icon: "public/icon.png + src/app/icon.png",
  apple: "src/app/apple-icon.png",
  mark: "public/brand/mark.{svg,png}",
});
