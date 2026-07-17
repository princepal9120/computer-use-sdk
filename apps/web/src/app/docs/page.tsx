import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { CodeBlock } from "@/components/ui/code-block";
import { InlineCode } from "@/components/ui/inline-code";
import { Callout } from "@/components/ui/callout";
import { CardLink } from "@/components/ui/card-link";
import { site } from "@/lib/site";
import { matrix, peers, type Cap } from "@/lib/providers";

const quickstart = `import { createSession } from "@prince/computer-use-sdk";
import { local } from "@prince/computer-use-sdk/local";

await using session = await createSession({ provider: local() });
await session.run({ type: "goto", url: "https://example.com" });
await session.screenshot();`;

const multiProvider = `import { createSession } from "@prince/computer-use-sdk";
import { browserbase } from "@prince/computer-use-sdk/browserbase";
import { openai } from "@prince/computer-use-sdk/openai";

// cloud browser session
await using browser = await createSession({
  provider: browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! }),
});
await browser.run({ type: "goto", url: "https://example.com" });

// model-driven agent
await using agent = await createSession({
  provider: openai({ apiKey: process.env.OPENAI_API_KEY! }),
});
await agent.run({ type: "agent", task: "Open example.com and list links" });`;

const cloud = matrix.filter((r) => r.group === "cloud");
const oss = matrix.filter((r) => r.group === "oss");
const transports = matrix.filter((r) => r.group === "transport");

function CapCell({ cap }: { cap: Cap }) {
  if (cap === "yes")
    return <span className="text-accent-600 dark:text-accent-400">Yes</span>;
  if (cap === "partial")
    return <span className="text-amber-500">Partial</span>;
  return <span className="text-muted">No</span>;
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      data-toc
      className="mt-14 scroll-mt-24 text-2xl font-semibold tracking-tight text-fg"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-[65ch] text-[15px] leading-7 text-fg/75">
      {children}
    </p>
  );
}

function MatrixTable({
  caption,
  headers,
  rows,
  rowCells,
}: {
  caption: string;
  headers: string[];
  rows: typeof matrix;
  rowCells: (r: (typeof matrix)[number]) => React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-muted">{caption}</h3>
      <div className="mt-3 overflow-x-auto rounded-xl border border-edge bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-edge">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.name}
                className="border-b border-edge/60 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-fg">{r.name}</td>
                {rowCells(r)}
                <td className="px-4 py-3">
                  <code className="rounded-md border border-edge bg-bg px-1.5 py-0.5 font-mono text-[11px] text-muted">
                    {r.pkg.replace("@prince/computer-use-sdk", ".../")}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <article className="text-fg">
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <span>Docs</span>
        <span className="text-muted/50">/</span>
        <span>Overview</span>
      </div>

      <h1 className="text-4xl font-semibold tracking-tight text-fg">
        Computer Use SDK
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
        One TypeScript API for computer-use, browser agents, desktops, and
        scrape. Plug any provider in, swap one import.
      </p>

      <div className="mt-6">
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-accent-700 dark:text-accent-400 hover:underline"
        >
          View on GitHub
          <ArrowUpRight size={13} />
        </a>
      </div>

      <div className="mt-8 max-w-[65ch]">
        <p className="text-[15px] leading-7 text-fg/75">
          Computer Use SDK wraps every computer-use stack behind one session.
          You write one typed action, and the provider you plugged in decides how
          it reaches a local browser, a cloud browser, a desktop sandbox, a
          vision agent, or a scrape API. Switching providers is an import
          change. Your code stays the same.
        </p>
      </div>

      <div className="mt-8">
        <CodeBlock code={quickstart} lang="tsx" title="session.ts" />
      </div>

      <H2 id="why">Why Computer Use SDK</H2>
      <P>
        Each provider ships its own session shape, its own action verbs, and its
        own retry story. Computer Use SDK puts one session in front of all of
        them. Every provider is a separate entry point, so your bundle only
        carries the providers you actually drive.
      </P>
      <P>
        One action vocabulary, <InlineCode>goto</InlineCode>,{" "}
        <InlineCode>click</InlineCode>, <InlineCode>type</InlineCode>,{" "}
        <InlineCode>screenshot</InlineCode>, and{" "}
        <InlineCode>agent</InlineCode>, maps to each provider&apos;s native
        calls. Local ships bundled Playwright, so the first session runs with
        zero extra installs.
      </P>

      <H2 id="quickstart">Quickstart</H2>
      <P>
        Install the core, then add only the peers you plug in. The first session
        can run fully local.
      </P>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg border border-edge bg-surface px-3 py-1.5 font-mono text-sm text-fg/80">
          {site.install}
        </span>
      </div>
      <div className="mt-6">
        <CodeBlock code={multiProvider} lang="tsx" title="providers.ts" />
      </div>

      <H2 id="start-here">Start here</H2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <CardLink href="#quickstart" title="Quickstart" description="Install, create a session, and run your first action in a few minutes." />
        <CardLink href="#matrix" title="Provider matrix" description="Browse all 16 providers and what each one covers." />
        <CardLink href={site.github} external title="GitHub" description="Source, issues, and contributing guide." />
        <CardLink href={site.npm} external title="npm" description="Package page and release history." />
      </div>

      <H2 id="matrix">Provider matrix</H2>
      <P>
        Every provider maps the same action vocabulary to its native API. The
        matrix shows what each one covers.
      </P>

      <MatrixTable
        caption="Cloud / model SDKs"
        headers={["Provider", "Browser", "Desktop", "API", "Vision", "Import"]}
        rows={cloud}
        rowCells={(r) => (
          <>
            <td className="px-4 py-3"><CapCell cap={r.browser} /></td>
            <td className="px-4 py-3"><CapCell cap={r.desktop} /></td>
            <td className="px-4 py-3"><CapCell cap={r.api} /></td>
            <td className="px-4 py-3"><CapCell cap={r.vision} /></td>
          </>
        )}
      />

      <MatrixTable
        caption="OSS / agent frameworks"
        headers={["Project", "Open source", "Browser", "Desktop", "Vision", "Import"]}
        rows={oss}
        rowCells={(r) => (
          <>
            <td className="px-4 py-3"><CapCell cap={r.oss} /></td>
            <td className="px-4 py-3"><CapCell cap={r.browser} /></td>
            <td className="px-4 py-3"><CapCell cap={r.desktop} /></td>
            <td className="px-4 py-3"><CapCell cap={r.vision} /></td>
          </>
        )}
      />

      <H2 id="transports">Local and Firecrawl</H2>
      <P>
        <InlineCode>local</InlineCode> ships a bundled Playwright browser with
        zero extra installs. <InlineCode>firecrawl</InlineCode> is a scrape
        add-on for content extraction, not a full session provider.
      </P>
      <div className="mt-4 overflow-x-auto rounded-xl border border-edge bg-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-edge">
              {["Transport", "Browser", "Desktop", "Vision", "Import"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transports.map((r) => (
              <tr key={r.name} className="border-b border-edge/60 last:border-0">
                <td className="px-4 py-3 font-medium text-fg">{r.name}</td>
                <td className="px-4 py-3"><CapCell cap={r.browser} /></td>
                <td className="px-4 py-3"><CapCell cap={r.desktop} /></td>
                <td className="px-4 py-3"><CapCell cap={r.vision} /></td>
                <td className="px-4 py-3">
                  <code className="rounded-md border border-edge bg-bg px-1.5 py-0.5 font-mono text-[11px] text-muted">
                    {r.pkg.replace("@prince/computer-use-sdk", ".../")}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        {transports.map((t) => t.note).filter(Boolean).join(" · ")}
      </p>

      <H2 id="peers">Optional peers</H2>
      <P>
        Install only the peers you plug in. The core ships none of them.
      </P>
      <div className="mt-4 flex flex-wrap gap-2">
        {peers.map((p) => (
          <span
            key={p.name}
            className="rounded-lg border border-edge bg-surface px-3 py-1.5 font-mono text-sm text-fg/80"
            title={p.for}
          >
            {p.name}
          </span>
        ))}
      </div>

      <H2 id="what-it-is-not">What it is not</H2>
      <P>
        Computer Use SDK is not a hosted agent runtime, a model, or an
        evaluation harness. It is the layer apps keep rebuilding by hand:
        provider setup, one consistent session and run, a shared action
        vocabulary, and one place to swap providers without rewriting calls.
      </P>
      <div className="mt-6 max-w-[65ch]">
        <Callout type="warning" title="Local checks are not reliability">
          The SDK validates actions against the provider before each run, but a
          real session still depends on your provider account: API scopes,
          regions, browser limits, and rate rules. Run one real session per
          provider in the environment that will drive it.
        </Callout>
      </div>

      <div className="mt-16 flex items-center justify-between border-t border-edge pt-6 text-sm">
        <a
          href={site.github}
          target="_blank"
          rel="noreferrer"
          className="text-muted transition-colors hover:text-fg"
        >
          View on GitHub
        </a>
        <a
          href="#quickstart"
          className="inline-flex items-center gap-1.5 font-medium text-fg transition-colors hover:text-muted"
        >
          Quickstart
          <ArrowRight size={14} weight="bold" />
        </a>
      </div>
    </article>
  );
}