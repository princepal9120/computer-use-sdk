import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { BrandLogo } from "@/components/ui/brand-logo";
import { matrix, matrixCaps, type MatrixRow } from "@/lib/providers";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/cn";

const groups: {
  title: string;
  blurb: string;
  group: MatrixRow["group"];
}[] = [
  {
    title: "Cloud / model SDKs",
    blurb: "Hosted browsers and computer-use models.",
    group: "cloud",
  },
  {
    title: "OSS / agent frameworks",
    blurb: "Open agents and browser frameworks.",
    group: "oss",
  },
  {
    title: "Transports",
    blurb: "Local runtime and scrape add-on.",
    group: "transport",
  },
];

function CapPills({ row }: { row: MatrixRow }) {
  const caps = matrixCaps(row);
  if (!caps.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1">
      {caps.map((c) => (
        <span
          key={c}
          className="rounded-md border border-edge bg-bg px-1.5 py-0.5 text-[10px] font-medium text-muted"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function ProviderCard({ row }: { row: MatrixRow }) {
  const short = row.pkg.replace("@prince/computer-use-sdk/", "");
  return (
    <li className="min-w-0">
      <div className="group flex h-full flex-col rounded-xl border border-edge bg-surface p-4 transition-colors hover:border-fg/15 hover:bg-bg">
        <div className="flex items-start gap-3">
          <BrandLogo
            domain={row.domain}
            monogram={row.monogram}
            title={row.name}
            className="h-9 w-9 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-fg">{row.name}</h4>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
              …/{short}
            </p>
          </div>
        </div>
        <CapPills row={row} />
      </div>
    </li>
  );
}

export function ProvidersDetail() {
  return (
    <section
      id="providers"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {site.providers} providers, one API
          </h2>
          <p className="mt-4 max-w-[48ch] text-muted">
            Cloud model SDKs, open-source agent frameworks, a bundled local
            browser, and a scrape add-on. Same createSession and session.run.
          </p>
        </div>
        <Link
          href="/docs#matrix"
          className="group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-medium text-accent-700 transition-colors hover:text-accent-800 dark:text-accent-400 dark:hover:text-accent-300 sm:self-auto"
        >
          View full matrix
          <ArrowRight
            size={14}
            weight="bold"
            className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="mt-12 space-y-12">
        {groups.map((g, gi) => {
          const rows = matrix.filter((r) => r.group === g.group);
          return (
            <Reveal key={g.group} delay={gi * 0.04}>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div>
                  <h3 className="text-base font-semibold text-fg">{g.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{g.blurb}</p>
                </div>
                <span className="font-mono text-xs text-muted">
                  {rows.length} {rows.length === 1 ? "adapter" : "adapters"}
                </span>
              </div>
              <ul
                className={cn(
                  "mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2",
                  g.group === "cloud" || g.group === "oss"
                    ? "lg:grid-cols-3"
                    : "lg:grid-cols-2"
                )}
              >
                {rows.map((r) => (
                  <ProviderCard key={r.name} row={r} />
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
