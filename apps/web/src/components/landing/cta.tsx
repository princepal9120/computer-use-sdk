import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";

export function Cta() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
      <Reveal className="relative overflow-hidden rounded-3xl border border-edge bg-surface px-6 py-16 text-center sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Drive any browser or desktop from one session.
          </h2>
          <p className="mt-4 text-muted">
            One createSession, {site.providers} providers, browser, desktop,
            vision, and scrape. Plug any provider in, swap one import.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="inline-flex items-center gap-3 rounded-full border border-edge bg-bg px-4 py-2.5 font-mono text-sm">
              <span className="text-muted">$</span>
              <span className="text-fg">{site.install}</span>
              <CopyButton value={site.install} className="text-muted hover:text-fg" />
            </div>
            <Link
              href="/docs"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Read the docs
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}