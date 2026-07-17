import {
  Browser,
  Cursor,
  Desktop,
  Eye,
  Fire,
  PlugsConnected,
} from "@/components/ui/icons";
import { Reveal } from "@/components/landing/reveal";
import { BrandLogo } from "@/components/ui/brand-logo";
import { stripProviders } from "@/lib/providers";
import { cn } from "@/lib/cn";

const actions = ["goto", "click", "type", "screenshot", "agent"];

function IconBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent-500/10 text-accent-600 dark:text-accent-400",
        className
      )}
    >
      {children}
    </span>
  );
}

function AdapterGrid() {
  return (
    <ul
      className="mt-auto grid w-full grid-cols-4 gap-2 pt-8 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-4"
      aria-label="Supported provider adapters"
    >
      {stripProviders.map((p) => (
        <li key={p.name} className="min-w-0">
          <div
            className="group flex h-full flex-col items-center justify-center gap-1.5 rounded-xl border border-edge/80 bg-bg/60 px-1.5 py-3 transition-colors hover:border-edge hover:bg-bg"
            title={p.name}
          >
            <BrandLogo
              domain={p.domain}
              monogram={p.monogram}
              title={p.name}
              className="h-8 w-8 opacity-90 transition-opacity group-hover:opacity-100 sm:h-9 sm:w-9"
            />
            <span className="w-full truncate text-center text-[10px] font-medium leading-tight text-muted group-hover:text-fg">
              {p.name}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function FeatureBento() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything behind one session
        </h2>
        <p className="mt-4 max-w-[52ch] text-muted">
          Local browsers, cloud agents, desktop sandboxes, vision, and scrape
          share the same createSession surface.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-3 lg:gap-4">
        {/* Hero tile: adapters - tinted, spans 2x2 */}
        <Reveal className="flex min-h-[300px] flex-col rounded-2xl border border-edge bg-accent-500/[0.06] p-6 sm:col-span-2 sm:p-8 lg:col-span-2 lg:row-span-2 dark:bg-accent-500/[0.07]">
          <IconBadge>
            <PlugsConnected size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Adapters</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Plug any provider in, swap one import. Each adapter is a separate
            entry point so unused drivers stay out of the bundle.
          </p>
          <AdapterGrid />
        </Reveal>

        {/* Local - mono surface */}
        <Reveal
          delay={0.05}
          className="flex flex-col rounded-2xl border border-edge bg-surface p-6"
        >
          <IconBadge>
            <Browser size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Local</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Bundled Playwright. First session runs with zero extra installs.
          </p>
          <div className="mt-auto pt-6 font-mono text-[11px] leading-relaxed text-muted">
            <div className="rounded-xl border border-edge bg-bg px-3 py-2.5">
              <span className="text-accent-600 dark:text-accent-400">import</span>{" "}
              {"{ local }"}
              <br />
              <span className="text-fg/70">provider: local()</span>
            </div>
          </div>
        </Reveal>

        {/* Vision - darker tint */}
        <Reveal
          delay={0.1}
          className="flex flex-col rounded-2xl border border-edge bg-fg/[0.03] p-6 dark:bg-fg/[0.04]"
        >
          <IconBadge>
            <Eye size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Vision</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Screenshots feed vision agents. Same session, same run call.
          </p>
          <p className="mt-auto pt-6 font-mono text-xs text-accent-600 dark:text-accent-400">
            session.screenshot()
          </p>
        </Reveal>

        {/* Vocabulary - accent wash */}
        <Reveal
          delay={0.12}
          className="flex flex-col rounded-2xl border border-edge bg-surface p-6"
        >
          <IconBadge>
            <Cursor size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">One vocabulary</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Five actions map to every provider&apos;s native calls.
          </p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
            {actions.map((a) => (
              <span
                key={a}
                className="rounded-[10px] border border-edge bg-bg px-2.5 py-1 font-mono text-[11px] text-fg/85"
              >
                {a}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Scrape */}
        <Reveal
          delay={0.14}
          className="flex flex-col rounded-2xl border border-edge bg-[linear-gradient(160deg,rgba(59,130,246,0.08),transparent_55%)] p-6 dark:bg-[linear-gradient(160deg,rgba(59,130,246,0.1),transparent_55%)]"
        >
          <IconBadge>
            <Fire size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Scrape</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Firecrawl as an optional peer for content extraction, not live UI.
          </p>
          <p className="mt-auto pt-6 font-mono text-xs text-muted">
            type: &quot;scrape&quot;
          </p>
        </Reveal>

        {/* Desktop */}
        <Reveal
          delay={0.16}
          className="flex flex-col rounded-2xl border border-edge bg-surface p-6"
        >
          <IconBadge>
            <Desktop size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Desktop</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Browser and desktop sandboxes behind the same run.
          </p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
            {["browser", "desktop"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-edge bg-bg px-3 py-1 text-[11px] font-medium text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
