import { CodeBlock } from "@/components/ui/code-block";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  {
    title: "createSession",
    body: "Pick a provider. One call opens the session.",
  },
  {
    title: "run",
    body: "goto, click, type, or hand off an agent task.",
  },
  {
    title: "screenshot",
    body: "Capture the display for vision or debugging.",
  },
  {
    title: "result",
    body: "Each step resolves when the provider finishes.",
  },
];

const agentCode = `await using session = await createSession({
  provider: openai({ apiKey: process.env.OPENAI_API_KEY! }),
});

await session.run({ type: "agent", task: "Open example.com and list links" });
const shot = await session.screenshot();`;

export function Pipeline() {
  return (
    <section
      id="concepts"
      className="scroll-mt-24 border-y border-edge bg-surface/60"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          One session, the whole flow
        </h2>
        <p className="mt-4 max-w-[48ch] text-muted">
          Every provider runs the same stages. Your code stays a single session
          object from open to close.
        </p>

        <Reveal className="mt-12 overflow-hidden rounded-2xl border border-edge bg-bg">
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className={[
                  "flex flex-col p-5 sm:p-6",
                  i < steps.length - 1 ? "border-edge border-b sm:border-b-0" : "",
                  i % 2 === 0 && i < steps.length - 1
                    ? "sm:border-r"
                    : "",
                  i === 1 ? "sm:border-b lg:border-b-0 lg:border-r" : "",
                  i === 2 ? "border-b sm:border-b-0 lg:border-r" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className="font-mono text-xs font-medium text-accent-600 dark:text-accent-400">
                  {s.title}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div>
            <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Agent runs stay one call
            </h3>
            <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted sm:text-base">
              Hand the SDK a task in plain language. The provider decides how to
              drive the browser or desktop until it finishes.
            </p>
          </div>
          <Reveal>
            <CodeBlock
              code={agentCode}
              lang="tsx"
              title="agent.ts"
              showLineNumbers={false}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
