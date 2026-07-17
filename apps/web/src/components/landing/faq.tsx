import { faqItems } from "@/lib/seo";
import { Reveal } from "@/components/landing/reveal";

export function FaqSection() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-[1400px] scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24"
      aria-labelledby="faq-heading"
    >
      <Reveal>
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
          >
            Questions teams ask before they ship
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Computer use, browser use, providers, install, and how the SDK fits
            next to hosted agent runtimes.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 divide-y divide-edge border-y border-edge">
        {faqItems.map((item) => (
          <details
            key={item.question}
            className="group py-5 open:pb-6"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-medium text-fg marker:content-none [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <span
                className="mt-0.5 shrink-0 text-muted transition-transform group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-muted sm:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
