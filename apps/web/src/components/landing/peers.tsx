import { peers } from "@/lib/providers";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";

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
      <p className="mt-8 font-mono text-sm text-muted">
        {site.install}
      </p>
    </section>
  );
}