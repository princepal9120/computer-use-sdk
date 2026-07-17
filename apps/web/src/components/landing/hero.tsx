"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { CodeDemo } from "@/components/landing/code-demo";
import { buttonVariants } from "@/components/ui/button";
import { FlipWord } from "@/components/ui/flip-word";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(72vh,640px)] bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(59,130,246,0.11),transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(59,130,246,0.14),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,black,transparent)] dark:opacity-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-5 pb-16 pt-14 sm:px-8 md:gap-12 md:pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:pt-20">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full border border-edge bg-surface/80 px-3 py-1 font-mono text-[11px] text-muted backdrop-blur-sm">
            {site.providers} providers · {site.license}
          </span>
          <h1 className="mt-5 max-w-[16ch] text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            <span className="block">One API for every</span>
            <span className="block">
              <FlipWord
                words={["computer", "browser"]}
                intervalMs={2000}
                className="text-fg"
              />
              -use stack
            </span>
          </h1>
          <p className="mt-5 max-w-[36ch] text-pretty text-base leading-relaxed text-muted sm:text-lg">
            One createSession and session.run across local browsers, cloud agents, desktops, and scrape.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/docs"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Read the docs
              <ArrowRight size={16} weight="bold" />
            </Link>
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View on GitHub
            </a>
          </div>
        </div>

        <div className="min-w-0 lg:pl-2">
          <CodeDemo />
        </div>
      </div>
    </section>
  );
}
