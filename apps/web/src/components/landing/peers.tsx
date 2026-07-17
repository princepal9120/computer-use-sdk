import { peers } from "@/lib/providers";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";
import { CopyButton } from "@/components/ui/copy-button";

export function Peers() {
  return (
    <section
      id="peers"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-24 sm:px-8"
    >
      <div className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Optional peers
        </h2>
        <p className="mt-3 text-muted">
          Install only the peers you plug in. The core ships none of them.
        </p>
      </div>
      <Reveal className="mt-10 flex flex-wrap gap-2">
        {peers.map((p) => (
          <span
            key={p}
            className="rounded-lg border border-edge bg-surface px-3 py-1.5 font-mono text-sm text-fg/80"
          >
            {p}
          </span>
        ))}
      </Reveal>
      <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-edge bg-bg px-4 py-2.5 font-mono text-sm">
        <span className="text-muted">$</span>
        <span className="text-fg">{site.install}</span>
        <CopyButton value={site.install} className="text-muted hover:text-fg" />
      </div>
    </section>
  );
}