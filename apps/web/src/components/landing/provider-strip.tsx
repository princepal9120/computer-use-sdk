import { Monogram } from "@/components/ui/monogram";
import { stripProviders } from "@/lib/providers";
import { Reveal } from "@/components/landing/reveal";

export function ProviderStrip() {
  return (
    <section className="border-y border-edge bg-surface/40">
      <div className="mx-auto max-w-[1400px] px-5 py-12 sm:px-8">
        <Reveal className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
          {stripProviders.map((p) => (
            <Monogram
              key={p.name}
              letters={p.monogram}
              title={p.name}
              className="h-6 w-6 text-fg opacity-50 transition-opacity duration-200 hover:opacity-100"
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}