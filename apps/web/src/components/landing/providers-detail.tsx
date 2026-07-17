import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { matrix } from "@/lib/providers";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";

const groups: { title: string; group: "cloud" | "oss" | "transport" }[] = [
  { title: "Cloud / model SDKs", group: "cloud" },
  { title: "OSS / agent frameworks", group: "oss" },
  { title: "Transports", group: "transport" },
];

export function ProvidersDetail() {
  return (
    <section
      id="providers"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 sm:px-8"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {site.providers} providers, one API
          </h2>
          <p className="mt-4 max-w-md text-muted">
            Cloud model SDKs, open-source agent frameworks, a bundled local
            browser, and a scrape add-on. All behind the same createSession and
            session.run.
          </p>
          <Link
            href="/docs#matrix"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 dark:text-accent-400"
          >
            View full matrix
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <Reveal className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
          {groups.map((g) => (
            <div key={g.group}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
                {g.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {matrix
                  .filter((r) => r.group === g.group)
                  .map((r) => (
                    <li key={r.name} className="flex flex-col gap-0.5">
                      <span className="text-sm text-fg">{r.name}</span>
                      <span className="truncate font-mono text-[11px] text-muted">
                        {r.pkg.replace("@prince/computer-use-sdk", ".../")}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}