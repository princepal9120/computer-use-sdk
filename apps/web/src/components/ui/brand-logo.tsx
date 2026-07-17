"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Provider brand mark — same visual treatment everywhere:
 * rounded square tile, brand favicon, monogram fallback.
 */
export function BrandLogo({
  domain,
  monogram,
  title,
  className,
}: {
  domain?: string;
  monogram?: string;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const letters = (monogram ?? title.slice(0, 2)).slice(0, 2).toUpperCase();
  const showFavicon = Boolean(domain) && !failed;

  // Google sz=128 → clear, consistent raster for every domain
  const src = domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`
    : undefined;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[22%] bg-bg ring-1 ring-edge",
        className
      )}
      title={title}
      role="img"
      aria-label={title}
    >
      {showFavicon && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-[68%] w-[68%] object-contain"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-fg/[0.08] text-[0.5em] font-semibold leading-none tracking-tight text-fg"
          aria-hidden
        >
          {letters}
        </span>
      )}
    </span>
  );
}
