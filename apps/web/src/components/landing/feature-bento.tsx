import {
  Browser,
  Cursor,
  Desktop,
  Eye,
  Fire,
  PlugsConnected,
} from "@/components/ui/icons";
import { Reveal } from "@/components/landing/reveal";
import { Monogram } from "@/components/ui/monogram";
import { stripProviders } from "@/lib/providers";
import { cn } from "@/lib/cn";

const actions = ["goto", "click", "type", "screenshot", "agent"];

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-400">
      {children}
    </span>
  );
}

function MonogramGrid() {
  return (
    <div className="mt-auto grid grid-cols-6 gap-2 pt-6">
      {stripProviders.map((p) => (
        <Monogram
          key={p.name}
          letters={p.monogram}
          title={p.name}
          className="h-7 w-7 opacity-70"
        />
      ))}
    </div>
  );
}

function ScreenshotFrame() {
  return (
    <div className="mt-auto flex items-center gap-3 rounded-lg border border-edge bg-bg p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500/10 text-accent-600 dark:text-accent-400">
        <Browser size={16} weight="duotone" />
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-edge">
        <span className="block h-full w-2/3 rounded-full bg-accent-500/60" />
      </div>
      <span className="font-mono text-[11px] text-muted">1280×800</span>
    </div>
  );
}

function ScanGlyph() {
  return (
    <div className="mt-auto flex items-center gap-3 rounded-lg border border-edge bg-bg p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500/10 text-accent-600 dark:text-accent-400">
        <Eye size={16} weight="duotone" />
      </span>
      <div className="grid flex-1 grid-cols-3 gap-1.5">
        <span className="h-2 rounded-full bg-accent-500/50" />
        <span className="h-2 rounded-full bg-accent-500/30" />
        <span className="h-2 rounded-full bg-accent-500/20" />
      </div>
    </div>
  );
}

function ActionPills() {
  return (
    <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
      {actions.map((a) => (
        <span
          key={a}
          className="rounded-md border border-edge bg-bg px-2.5 py-1 font-mono text-[11px] text-fg/80"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function ContentLines() {
  return (
    <div className="mt-auto space-y-1.5 rounded-lg border border-edge bg-bg p-3">
      {[90, 70, 80, 45].map((w, i) => (
        <span
          key={i}
          className="block h-1.5 rounded-full bg-edge"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

function WindowsGlyph() {
  return (
    <div className="mt-auto flex items-center gap-2 rounded-lg border border-edge bg-bg p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-500/10 text-accent-600 dark:text-accent-400">
        <Desktop size={16} weight="duotone" />
      </span>
      <span className="font-mono text-[11px] text-muted">browser + desktop</span>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything behind one session
        </h2>
        <p className="mt-3 text-muted">
          Local browsers, cloud agents, desktop sandboxes, vision, and scrape,
          behind one createSession.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-3">
        <Reveal className="flex flex-col rounded-2xl border border-edge bg-accent-500/[0.04] p-6 sm:col-span-2 sm:p-8 lg:col-span-2 lg:row-span-2">
          <IconBadge>
            <PlugsConnected size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Adapters</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Plug any provider in, swap one import. Each adapter is its own entry
            point, so your bundle only carries the providers you drive.
          </p>
          <MonogramGrid />
        </Reveal>

        <Reveal delay={0.06} className="flex flex-col rounded-2xl border border-edge bg-surface p-6">
          <IconBadge>
            <Browser size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Local</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Zero-install local browser. Bundled Playwright, no extra deps.
          </p>
          <ScreenshotFrame />
        </Reveal>

        <Reveal delay={0.12} className="flex flex-col rounded-2xl border border-edge bg-surface p-6">
          <IconBadge>
            <Eye size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Vision</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            See the screen. Screenshot feeds vision-driven agents.
          </p>
          <ScanGlyph />
        </Reveal>

        <Reveal delay={0.18} className="flex flex-col rounded-2xl border border-edge bg-surface p-6">
          <IconBadge>
            <Cursor size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">One vocabulary</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Five actions map to every provider&apos;s native calls.
          </p>
          <ActionPills />
        </Reveal>

        <Reveal delay={0.24} className="flex flex-col rounded-2xl border border-edge bg-surface p-6">
          <IconBadge>
            <Fire size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Scrape</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Scrape any page. Firecrawl add-on for content extraction.
          </p>
          <ContentLines />
        </Reveal>

        <Reveal
          delay={0.3}
          className={cn(
            "flex flex-col rounded-2xl border border-edge bg-surface p-6"
          )}
        >
          <IconBadge>
            <Desktop size={18} weight="duotone" />
          </IconBadge>
          <h3 className="mt-4 text-lg font-semibold">Desktop</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Browser and desktop sandboxes behind the same run.
          </p>
          <WindowsGlyph />
        </Reveal>
      </div>
    </section>
  );
}