"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MagnifyingGlass, X } from "@/components/ui/icons";
import { flatNav } from "@/lib/docs-nav";

export function SearchPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setActive(0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flatNav.slice(0, 8);
    return flatNav
      .filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  useEffect(() => setActive(0), [query]);

  function go(href: string, external?: boolean) {
    setOpen(false);
    if (external) {
      window.open(href, "_blank", "noreferrer");
    } else {
      router.push(href);
    }
  }

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      go(results[active].href, results[active].external);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex h-9 items-center gap-2 rounded-full border border-edge pl-3 pr-2 text-sm text-muted transition-colors hover:border-fg/30 hover:text-fg"
        aria-label="Search docs"
      >
        <MagnifyingGlass size={16} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-edge bg-bg px-1.5 font-mono text-[10px] text-muted">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-edge bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-edge px-4">
              <MagnifyingGlass size={18} className="text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search the docs..."
                className="h-14 w-full bg-transparent text-base text-fg outline-none placeholder:text-muted/70"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="rounded-md p-1 text-muted hover:text-fg"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  No matches.
                </li>
              )}
              {results.map((r, i) => (
                <li key={r.label + r.href}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href, r.external)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      i === active ? "bg-accent-500/10 text-fg" : "text-fg hover:bg-bg"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-medium">{r.label}</span>
                      <span className="text-xs text-muted">{r.group}</span>
                    </span>
                    <ArrowRight size={14} className="text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}