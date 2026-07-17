import type { Metadata } from "next";
import Link from "next/link";
import { faqItems, buildMetadata, pages, faqPageJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata(pages.faq);

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-[800px] px-5 py-14 sm:px-8 sm:py-20">
      <JsonLd data={faqPageJsonLd()} />

      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
        FAQ
      </p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
        Computer Use & Browser Use SDK
      </h1>
      <p className="mt-5 text-pretty text-base leading-relaxed text-muted sm:text-lg">
        Straight answers about {site.name}: providers, install, licensing, and
        how one session API covers browser agents and computer-use models.
      </p>

      <div className="mt-12 divide-y divide-edge border-y border-edge">
        {faqItems.map((item) => (
          <article key={item.question} className="py-6" id={slugify(item.question)}>
            <h2 className="text-lg font-semibold tracking-tight text-fg">
              {item.question}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {item.answer}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/docs" className={buttonVariants({ variant: "primary", size: "lg" })}>
          Read the docs
        </Link>
        <Link href="/#providers" className={buttonVariants({ variant: "outline", size: "lg" })}>
          Browse providers
        </Link>
      </div>
    </main>
  );
}

function slugify(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
