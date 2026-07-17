import { Hero } from "@/components/landing/hero";
import { ProviderStrip } from "@/components/landing/provider-strip";
import { WhySection } from "@/components/landing/why-section";
import { FeatureBento } from "@/components/landing/feature-bento";
import { Pipeline } from "@/components/landing/pipeline";
import { ProvidersDetail } from "@/components/landing/providers-detail";
import { Peers } from "@/components/landing/peers";
import { Cta } from "@/components/landing/cta";

export default function Page() {
  return (
    <main>
      <Hero />
      <ProviderStrip />
      <WhySection />
      <FeatureBento />
      <Pipeline />
      <ProvidersDetail />
      <Peers />
      <Cta />
    </main>
  );
}