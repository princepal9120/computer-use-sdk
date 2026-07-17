import { Camera, Check, Cursor, Rocket } from "@/components/ui/icons";
import { CodeBlock } from "@/components/ui/code-block";
import { Reveal } from "@/components/landing/reveal";

const steps = [
  { icon: Rocket, title: "createSession", body: "Pick a provider, one call." },
  { icon: Cursor, title: "run", body: "goto, click, type, or an agent task." },
  { icon: Camera, title: "screenshot", body: "See the screen, feed vision." },
  { icon: Check, title: "result", body: "Resolves when the step is done." },
];

const agentCode = `await using session = await createSession({
  provider: openai({ apiKey: process.env.OPENAI_API_KEY! }),
});

await session.run({ type: "agent", task: "Open example.com and list links" });
const shot = await session.screenshot();`;

export function Pipeline() {
  return (
    <section id="concepts" className="scroll-mt-24 border-y border-edge bg-surface/40">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          One session, the whole flow.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Every provider runs the same four stages. Your code stays a single
          session.
        </p>

        <Reveal className="mt-12">
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex flex-col rounded-xl border border-edge bg-bg p-5"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600 dark:text-accent-400">
                  <s.icon size={18} weight="duotone" />
                </span>
                <div className="mt-3 font-mono text-xs text-muted">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-1 font-mono text-sm font-medium text-fg">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="mt-14 max-w-3xl">
          <h3 className="text-xl font-semibold tracking-tight">
            Agent runs stay one call
          </h3>
          <p className="mt-2 text-muted">
            Hand the SDK a task in plain language. The provider decides how to
            drive the browser or desktop to finish it.
          </p>
          <Reveal className="mt-6">
            <CodeBlock code={agentCode} lang="tsx" title="agent.ts" showLineNumbers={false} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}