/**
 * Open Graph image — Sandbox SDK–style dark arc with real provider logos.
 *
 * Output: public/og.png, src/app/opengraph-image.png, src/app/twitter-image.png
 * Run: bun scripts/generate-og.mjs
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const repoRoot = join(root, "..", "..");
const require = createRequire(join(repoRoot, "packages/sdk/package.json"));
const { chromium } = require("playwright");

const W = 1200;
const H = 630;

/** Unique provider brands (domains match apps/web/src/lib/providers.ts). */
const providers = [
  { name: "Playwright", domain: "playwright.dev" },
  { name: "OpenAI", domain: "openai.com" },
  { name: "Anthropic", domain: "anthropic.com" },
  { name: "TryCUA", domain: "cua.ai" },
  { name: "Browserbase", domain: "browserbase.com" },
  { name: "Steel", domain: "steel.dev" },
  { name: "Hyperbrowser", domain: "hyperbrowser.ai" },
  { name: "Browser Use", domain: "browser-use.com" },
  { name: "Skyvern", domain: "skyvern.com" },
  { name: "OpenHands", domain: "all-hands.dev" },
  { name: "Stagehand", domain: "docs.stagehand.dev" },
  { name: "AgentQL", domain: "agentql.com" },
  { name: "Midscene", domain: "midscenejs.com" },
  { name: "Nanobrowser", domain: "nanobrowser.ai" },
  { name: "Firecrawl", domain: "firecrawl.dev" },
];

function faviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

/**
 * Flat upper parabola: high at center, slightly lower at ends,
 * always above the wordmark band.
 */
function upperCurve(n, padX = 70, yPeak = 88, yEnd = 200) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = padX + t * (W - padX * 2);
    // gentle U: peak at center (smaller y), ends lower (larger y)
    const y = yPeak + (yEnd - yPeak) * Math.pow(2 * t - 1, 2);
    out.push({ x, y });
  }
  return out;
}

const logoSize = 50;
const positions = upperCurve(providers.length);

const logoTiles = providers
  .map((p, i) => {
    const { x, y } = positions[i];
    const s = logoSize;
    return `
    <div class="logo" style="left:${(x - s / 2).toFixed(1)}px;top:${(y - s / 2).toFixed(1)}px;width:${s}px;height:${s}px" title="${p.name}">
      <img src="${faviconUrl(p.domain)}" alt="${p.name}" width="${s - 16}" height="${s - 16}" referrerpolicy="no-referrer" />
    </div>`;
  })
  .join("\n");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap");
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    background: #07080c;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  }
  .frame {
    position: relative;
    width: ${W}px;
    height: ${H}px;
    background:
      radial-gradient(ellipse 90% 70% at 50% 100%, rgba(59, 130, 246, 0.10), transparent 55%),
      radial-gradient(ellipse 50% 40% at 50% 55%, rgba(37, 99, 235, 0.06), transparent 70%),
      #07080c;
  }
  canvas#dots {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .center {
    position: absolute;
    left: 50%;
    top: 58%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    gap: 26px;
    z-index: 3;
  }
  .mark {
    width: 84px;
    height: 84px;
    border-radius: 20px;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 0 0 1px rgba(147, 197, 253, 0.25),
      0 12px 40px rgba(59, 130, 246, 0.45),
      0 2px 8px rgba(0, 0, 0, 0.4);
    flex-shrink: 0;
  }
  .mark svg { display: block; }
  .wordmark {
    color: #f5f5f4;
    font-size: 60px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
    white-space: nowrap;
    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.5);
  }
  .logo {
    position: absolute;
    z-index: 2;
    border-radius: 14px;
    background: #ffffff;
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 10px 28px rgba(0, 0, 0, 0.55),
      0 0 24px rgba(59, 130, 246, 0.16);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .logo img {
    display: block;
    object-fit: contain;
  }
</style>
</head>
<body>
  <div class="frame">
    <canvas id="dots" width="${W}" height="${H}"></canvas>
    ${logoTiles}
    <div class="center">
      <div class="mark" aria-hidden="true">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path d="M5 3l15 7.2-6.3 1.7L11 19 5 3z" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="wordmark">Computer Use SDK</div>
    </div>
  </div>
  <script>
    const canvas = document.getElementById("dots");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    // Dome behind logos + wordmark (Sandbox-style)
    const cx = W / 2;
    const cy = H * 0.78;
    const rInner = 180;
    const rOuter = 460;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < rInner || dist > rOuter) continue;
        if (dy > 30) continue;

        const t = (dist - rInner) / (rOuter - rInner);
        const band = Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
        const ang = Math.atan2(dy, dx);
        const angFromTop = Math.abs(ang + Math.PI / 2);
        if (angFromTop > Math.PI * 0.62) continue;
        const angFade = 1 - Math.pow(angFromTop / (Math.PI * 0.62), 1.6);
        const density = band * angFade * 0.5;

        const cell = 4;
        const gx = Math.floor(x / cell);
        const gy = Math.floor(y / cell);
        const hash = ((gx * 73856093) ^ (gy * 19349663)) >>> 0;
        const n = (hash % 1000) / 1000;
        if (n > density) continue;

        const size = n < density * 0.35 ? 1.7 : 1.15;
        const blueMix = 0.35 + t * 0.55;
        const r = Math.round(245 * (1 - blueMix) + 59 * blueMix);
        const g = Math.round(245 * (1 - blueMix) + 130 * blueMix);
        const b = Math.round(244 * (1 - blueMix) + 246 * blueMix);
        const a = 0.35 + band * 0.55;

        ctx.beginPath();
        ctx.fillStyle = \`rgba(\${r},\${g},\${b},\${a})\`;
        ctx.arc(x + 0.5, y + 0.5, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  </script>
</body>
</html>`;

const publicDir = join(root, "public");
const appDir = join(root, "src", "app");
mkdirSync(publicDir, { recursive: true });
mkdirSync(appDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});

await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll("img")];
  await Promise.all(
    imgs.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              img.onload = () => res();
              img.onerror = () => res();
              setTimeout(res, 5000);
            }),
    ),
  );
});
await page.waitForTimeout(400);

const buf = await page.screenshot({ type: "png", omitBackground: false });
await browser.close();

writeFileSync(join(publicDir, "og.png"), buf);
writeFileSync(join(appDir, "opengraph-image.png"), buf);
writeFileSync(join(appDir, "twitter-image.png"), buf);

console.log("Generated OG image with provider logos:", {
  size: `${W}×${H}`,
  providers: providers.length,
  public: "public/og.png",
  bytes: buf.length,
});
