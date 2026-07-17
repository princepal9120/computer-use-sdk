import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { ProviderStrip } from "@/components/landing/provider-strip";
import { WhySection } from "@/components/landing/why-section";
import { FeatureBento } from "@/components/landing/feature-bento";
import { Pipeline } from "@/components/landing/pipeline";
import { ProvidersDetail } from "@/components/landing/providers-detail";
import { Peers } from "@/components/landing/peers";
import { FaqSection } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, marketingJsonLd, pages } from "@/lib/seo";

export const metadata: Metadata = buildMetadata(pages.home);

export default function Page() {
  return (
    <main>
      <JsonLd data={marketingJsonLd()} />
      <Hero />
      <ProviderStrip />
      <WhySection />
      <FeatureBento />
      <Pipeline />
      <ProvidersDetail />
      <Peers />
      <FaqSection />
      <Cta />
    </main>
  );
}
