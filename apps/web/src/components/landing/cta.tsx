import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";

export function Cta() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
      <Reveal className="relative overflow-hidden rounded-2xl border border-edge bg-fg px-6 py-14 text-bg sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 45%), radial-gradient(circle at 80% 80%, #60a5fa 0%, transparent 40%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Drive any browser or desktop from one session
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] text-bg/70">
            {site.providers} providers. Browser, desktop, vision, and scrape.
            Swap one import when the stack changes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div className="inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-bg/15 bg-bg/10 px-4 py-2.5 font-mono text-sm text-bg backdrop-blur-sm">
              <span className="shrink-0 text-bg/55">$</span>
              <span>{site.install}</span>
              <CopyButton
                value={site.install}
                className="shrink-0 text-bg/55 hover:text-bg"
              />
            </div>
            <Link
              href="/docs"
              className={buttonVariants({ variant: "accent", size: "lg" })}
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
