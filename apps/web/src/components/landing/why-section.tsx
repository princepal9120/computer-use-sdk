import { CodeBlock } from "@/components/ui/code-block";
import { InlineCode } from "@/components/ui/inline-code";
import { Reveal } from "@/components/landing/reveal";

const quickstart = `import { createSession } from "computer-use-sdk";
import { local } from "computer-use-sdk/local";

await using session = await createSession({ provider: local() });
await session.run({ type: "goto", url: "https://example.com" });
await session.screenshot();`;

const points = [
  {
    title: "One session shape",
    body: "Providers stop shipping different session APIs. You get createSession and session.run everywhere.",
  },
  {
    title: "Tree-shakeable adapters",
    body: "Each provider is its own entry point. Your bundle only includes the drivers you import.",
  },
  {
    title: "Shared action verbs",
    body: (
      <>
        <InlineCode>goto</InlineCode>, <InlineCode>click</InlineCode>,{" "}
        <InlineCode>type</InlineCode>, <InlineCode>screenshot</InlineCode>, and{" "}
        <InlineCode>agent</InlineCode> map to each native API.
      </>
    ),
  },
];

export function WhySection() {
  return (
    <section
      id="why"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why Computer Use SDK
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-muted">
            Each stack invents its own verbs and session model. This SDK puts
            one TypeScript surface in front of all of them.
          </p>

          <ul className="mt-10 space-y-0 divide-y divide-edge border-y border-edge">
            {points.map((p) => (
              <li key={p.title} className="py-5">
                <h3 className="text-sm font-semibold text-fg">{p.title}</h3>
                <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-muted">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <Reveal className="lg:sticky lg:top-24">
          <CodeBlock
            code={quickstart}
            lang="tsx"
            title="session.ts"
            showLineNumbers={false}
          />
          <p className="mt-3 text-xs text-muted">
            Local ships bundled Playwright. No API key for the first run.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
