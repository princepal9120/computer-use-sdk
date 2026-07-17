"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, GithubLogo, List } from "@/components/ui/icons";
import { AnimatedBrandName } from "@/components/ui/animated-brand-name";
import { SiteMark } from "@/components/ui/site-mark";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchPalette } from "@/components/search-palette";

const links = [
  { label: "Docs", href: "/docs" },
  { label: "Providers", href: "/#providers" },
  { label: "Why", href: "/#why" },
  { label: "Matrix", href: "/docs#matrix" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[70] h-16 transition-colors ${
        scrolled
          ? "border-b border-edge bg-bg/80 backdrop-blur-md"
          : "border-b border-transparent bg-bg/0"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-fg"
          aria-label={site.name}
        >
          <SiteMark size={28} />
          <AnimatedBrandName />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted transition-colors hover:bg-bg hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block">
            <SearchPalette />
          </div>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg transition-colors hover:bg-bg hover:text-muted"
          >
            <GithubLogo size={18} />
          </a>
          <ThemeToggle />
          <Link
            href="/docs"
            className="ml-1 hidden items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition-transform active:scale-[0.98] sm:inline-flex"
          >
            Read the docs
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-fg md:hidden"
          >
            <List size={20} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-b border-edge bg-bg md:hidden">
          <div className="mx-auto flex max-w-[1400px] flex-col px-5 py-2 sm:px-8">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-edge/60 py-3 text-sm text-fg last:border-0"
              >
                {l.label}
                <ArrowUpRight size={14} className="text-muted" />
              </Link>
            ))}
            <Link
              href="/docs"
              onClick={() => setOpen(false)}
              className="my-3 inline-flex items-center justify-center rounded-full bg-fg px-4 py-2.5 text-sm font-medium text-bg"
            >
              Read the docs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}