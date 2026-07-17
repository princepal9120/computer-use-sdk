import { BrandLogo } from "@/components/ui/brand-logo";
import { stripProviders } from "@/lib/providers";

function LogoTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
      aria-hidden={ariaHidden || undefined}
    >
      {stripProviders.map((p) => (
        <li key={`${ariaHidden ? "dup-" : ""}${p.name}`} className="shrink-0">
          <div className="flex items-center gap-2.5 rounded-full border border-edge bg-surface/70 px-3 py-1.5">
            <BrandLogo
              domain={p.domain}
              monogram={p.monogram}
              title={p.name}
              className="h-5 w-5"
            />
            <span className="text-xs font-medium text-muted">{p.name}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ProviderStrip() {
  return (
    <section
      className="border-y border-edge bg-surface/50"
      aria-label="Supported providers"
    >
      <div className="py-5 sm:py-6">
        <div className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-surface to-transparent sm:w-16"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-surface to-transparent sm:w-16"
          />

          <div className="provider-marquee flex w-max items-center">
            <LogoTrack />
            <LogoTrack ariaHidden />
          </div>

          <p className="sr-only">{stripProviders.map((p) => p.name).join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
