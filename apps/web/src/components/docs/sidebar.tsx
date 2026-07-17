"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, CaretDown, List } from "@phosphor-icons/react";
import { docsNav } from "@/lib/docs-nav";
import { cn } from "@/lib/cn";

export function DocsSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <aside className="lg:sticky lg:top-16 lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:py-10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-lg border border-edge bg-surface px-4 py-3 text-sm font-medium lg:hidden"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <List size={16} />
          Contents
        </span>
        <CaretDown
          size={16}
          className={cn("transition-transform", open && "rotate-180")}
        />
      </button>

      <nav className={cn("mt-4 lg:mt-0", open ? "block" : "hidden lg:block")}>
        {docsNav.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="px-3 text-xs font-semibold text-muted">
              {group.title}
            </h2>
            <ul className="mt-2 space-y-0.5">
              {group.items.map((item) => {
                const isActive = !item.external && pathname === item.href;
                const cls = cn(
                  "flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent-500/10 font-medium text-accent-700 dark:text-accent-400"
                    : "text-muted hover:bg-bg hover:text-fg"
                );
                return (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className={cls}
                      >
                        <span className="truncate">{item.label}</span>
                        <ArrowUpRight
                          size={12}
                          className="shrink-0 text-muted/60"
                        />
                      </a>
                    ) : (
                      <Link href={item.href} className={cls}>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}