"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { CodeBlock } from "@/components/ui/code-block";
import { BrandLogo } from "@/components/ui/brand-logo";
import { demoProviders } from "@/lib/providers";
import { cn } from "@/lib/cn";

function codeFor(p: (typeof demoProviders)[number]) {
  return `import { createSession } from "@prince/computer-use-sdk";
import { ${p.factory} } from "${p.importFrom}";

await using session = await createSession({ provider: ${p.config} });

${p.run}`;
}

export function CodeDemo() {
  const [index, setIndex] = useState(0);
  const count = demoProviders.length;
  const p = demoProviders[index];
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  useEffect(() => {
    const el = itemRefs.current[index];
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  }

  return (
    <div
      role="group"
      aria-label="Provider code example. Use arrow keys to switch."
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="w-full overflow-hidden rounded-2xl border border-edge bg-surface shadow-surface-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40"
    >
      <div className="border-b border-edge bg-bg/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted">Provider</span>
          <span className="rounded-full border border-edge bg-surface px-3 py-1 text-xs font-semibold text-fg">
            {p.name}
          </span>
          <span className="hidden text-xs text-muted sm:block">
            {count} · arrows or click
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous provider"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:border-fg/25 hover:text-fg active:scale-[0.98]"
          >
            <ArrowRight size={16} className="rotate-180" />
          </button>

          <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max items-center gap-2 px-0.5 py-1">
              {demoProviders.map((pr, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={pr.id}
                    ref={(node) => {
                      itemRefs.current[i] = node;
                    }}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={pr.name}
                    aria-pressed={isActive}
                    title={pr.name}
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ease-out active:scale-[0.98]",
                      isActive
                        ? "border-accent-500/45 bg-surface ring-2 ring-accent-500/35 sm:scale-105"
                        : "border-edge bg-bg/80 opacity-55 hover:opacity-100"
                    )}
                  >
                    <BrandLogo
                      domain={pr.domain}
                      monogram={pr.monogram}
                      title={pr.name}
                      className="h-6 w-6"
                    />
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next provider"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-edge text-muted transition-colors hover:border-fg/25 hover:text-fg active:scale-[0.98]"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <CodeBlock code={codeFor(p)} lang="tsx" title={`${p.factory}.ts`} flush />
    </div>
  );
}
