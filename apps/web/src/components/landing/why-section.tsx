import { CodeBlock } from "@/components/ui/code-block";
import { Reveal } from "@/components/landing/reveal";

const quickstart = `import { createSession } from "@prince/computer-use-sdk";
import { local } from "@prince/computer-use-sdk/local";

await using session = await createSession({ provider: local() });
await session.run({ type: "goto", url: "https://example.com" });
await session.screenshot();`;

export function WhySection() {
  return (
    <section id="why" className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Why Computer Use SDK
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
          <p>
            Each provider ships its own session shape, its own action verbs,
            and its own retry story. Computer Use SDK puts one session in front
            of all of them.
          </p>
          <p>
            Every provider is a separate entry point, so your bundle only
            carries the providers you actually drive. The core stays tiny.
          </p>
          <p>
            One action vocabulary, <span className="font-mono text-fg">goto</span>,{" "}
            <span className="font-mono text-fg">click</span>,{" "}
            <span className="font-mono text-fg">type</span>,{" "}
            <span className="font-mono text-fg">screenshot</span>, and{" "}
            <span className="font-mono text-fg">agent</span>, maps to each
            provider&apos;s native calls. Swap one import, keep the same code.
          </p>
          <p>
            Local ships bundled Playwright, so the first session runs with zero
            extra installs. Cloud browsers, desktop sandboxes, vision agents,
            and scrape plug in as optional peers.
          </p>
        </div>
      </div>
      <Reveal className="mt-10 max-w-2xl">
        <CodeBlock code={quickstart} lang="tsx" title="session.ts" showLineNumbers={false} />
      </Reveal>
    </section>
  );
}