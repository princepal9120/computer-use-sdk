import { cn } from "@/lib/cn";

/** Shared brand mark — same glyph used in nav, footer, favicon, and app icons. */
export function SiteMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-accent-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <CursorGlyph size={Math.round(size * 0.54)} />
    </span>
  );
}

export function CursorGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 3l15 7.2-6.3 1.7L11 19 5 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Inline SVG for static assets / metadata (absolute colors, no CSS vars). */
export function siteMarkSvg(size = 32): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#3b82f6"/>
  <path d="M9 7.5l12.5 6-5.25 1.4L13.5 21.5 9 7.5z" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
</svg>`;
}
