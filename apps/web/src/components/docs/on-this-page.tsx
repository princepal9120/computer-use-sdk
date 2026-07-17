"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Heading = { id: string; label: string };

export function OnThisPage() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const root = document.getElementById("docs-content");
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-toc]")
    );
    const items = els.map((el) => ({
      id: el.id,
      label: el.textContent || el.id,
    }));
    setHeadings(items);
    if (!items.length) return;
    setActive(items[0].id);

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]) {
          setActive((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  if (!headings.length) return null;

  return (
    <div className="sticky top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto py-10">
      <p className="text-xs font-semibold text-muted">On this page</p>
      <ul className="mt-3 space-y-1.5 border-l border-edge">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "-ml-px block border-l border-transparent py-1 pl-3 text-sm transition-colors",
                active === h.id
                  ? "border-accent-500 font-medium text-accent-700 dark:text-accent-400"
                  : "text-muted hover:text-fg"
              )}
            >
              {h.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}