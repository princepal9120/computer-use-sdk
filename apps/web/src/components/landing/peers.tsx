import { peers } from "@/lib/providers";
import { site } from "@/lib/site";
import { Reveal } from "@/components/landing/reveal";
import { CopyButton } from "@/components/ui/copy-button";

export function Peers() {
  return (
    <section id="peers" className="border-y border-edge bg-surface/50">
      <div className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Optional peers
            </h2>
            <p className="mt-4 max-w-[40ch] text-muted">
              Install only the peers you plug in. The core ships none of them.
            </p>

            <div className="mt-8 rounded-2xl border border-edge bg-bg p-4 sm:p-5">
              <p className="text-xs font-medium text-muted">Get the core</p>
              <div className="mt-3 flex items-center gap-3 overflow-x-auto rounded-xl border border-edge bg-surface px-3 py-2.5 font-mono text-sm">
                <span className="shrink-0 text-muted">$</span>
                <span className="min-w-0 truncate text-fg">{site.install}</span>
                <CopyButton
                  value={site.install}
                  className="shrink-0 text-muted hover:text-fg"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Then add the peer package for each provider you drive. Adapters
                stay tree-shakeable.
              </p>
            </div>
          </div>

          <Reveal>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {peers.map((p) => (
                <li key={p.name}>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-bg px-3 py-2.5 transition-colors hover:border-fg/15 hover:bg-surface">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-[13px] text-fg">
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">{p.for}</p>
                    </div>
                    <CopyButton
                      value={p.name}
                      className="shrink-0 text-muted hover:text-fg"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
