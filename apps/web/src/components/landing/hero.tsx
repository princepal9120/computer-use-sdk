import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { CodeDemo } from "@/components/landing/code-demo";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.08),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 grid-bg opacity-70 [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)] [-webkit-mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-5 pb-20 pt-16 sm:px-8 md:pb-28 md:pt-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center rounded-full border border-edge bg-surface px-3 py-1 font-mono text-xs text-muted">
            {site.providers} providers · {site.license}
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            One API for every computer-use stack
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
            One createSession and session.run across local browsers, cloud
            agents, desktops, and scrape.
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
        <div className="lg:pl-4">
          <CodeDemo />
        </div>
      </div>
    </section>
  );
}