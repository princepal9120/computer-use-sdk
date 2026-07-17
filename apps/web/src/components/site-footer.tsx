import Link from "next/link";
import { GithubLogo } from "@/components/ui/icons";
import { AnimatedBrandName } from "@/components/ui/animated-brand-name";
import { SiteMark } from "@/components/ui/site-mark";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Providers", href: "/#providers" },
      { label: "Why", href: "/#why" },
      { label: "FAQ", href: "/faq" },
      { label: "Matrix", href: "/docs#matrix" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: site.github, external: true },
      { label: "npm", href: site.npm, external: true },
      { label: "Quickstart", href: "/docs#quickstart" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Issues", href: `${site.github}/issues`, external: true },
      { label: "Contribute", href: site.github, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-10 px-5 py-16 sm:px-8 md:grid-cols-5">
        <div className="col-span-2 md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5 text-fg">
            <SiteMark size={28} />
            <AnimatedBrandName />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {site.tagline} Open source, plug any provider in or out.
          </p>
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
          >
            <GithubLogo size={16} />
            {site.org}/computer-use-sdk
          </a>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-edge">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:px-8">
          <p>{site.name} is open source under the {site.license} license.</p>
          <p>Built by {site.org}.</p>
        </div>
      </div>
    </footer>
  );
}