import { site } from "@/lib/site";
import { stripProviders } from "@/lib/providers";

/** Primary keyword set for computer-use / browser-agent discovery. */
export const seoKeywords = [
  "computer use SDK",
  "browser use SDK",
  "computer-use TypeScript",
  "browser agent SDK",
  "createSession",
  "session.run",
  "Playwright computer use",
  "OpenAI computer use",
  "Anthropic computer use",
  "Browserbase SDK",
  "browser automation TypeScript",
  "desktop agent SDK",
  "multi provider computer use",
  "unified browser automation API",
] as const;

export const faqItems = [
  {
    question: "What is Computer Use SDK?",
    answer:
      "Computer Use SDK is a TypeScript library that puts one createSession and session.run API in front of computer-use stacks, browser agents, desktop sandboxes, vision tools, and scrape providers. Swap providers with a single import instead of rewriting session code.",
  },
  {
    question: "Is this a browser-use SDK as well?",
    answer:
      "Yes. The same surface covers browser automation (local Playwright, Browserbase, Steel, Hyperbrowser, Browser Use, Stagehand, and more) and full computer-use models (OpenAI, Anthropic, TryCUA). The product wordmark cycles Computer Use SDK and Browser Use SDK because both are first-class.",
  },
  {
    question: "Which providers are supported?",
    answer: `The SDK ships adapters for ${site.providers} providers: ${stripProviders.map((p) => p.name).join(", ")}. Each adapter is a separate entry point so unused drivers stay out of your bundle.`,
  },
  {
    question: "How do I install Computer Use SDK?",
    answer: `Install with ${site.install}. Then import createSession from ${site.packageName} and a provider factory such as local from ${site.packageName}/local.`,
  },
  {
    question: "Do I need a hosted agent runtime?",
    answer:
      "No. Computer Use SDK is an open-source adapter layer, not a hosted agent product. You bring API keys and run sessions in your own process. Local Playwright works without cloud credentials.",
  },
  {
    question: "Can I switch from Browserbase to local Playwright?",
    answer:
      "Yes. Keep createSession and session.run the same; change only the provider import and config. Shared action verbs (goto, click, type, screenshot, agent, extract) map to each native API.",
  },
  {
    question: "Is Computer Use SDK free and open source?",
    answer: `Yes. It is released under the ${site.license} license on GitHub (${site.org}/computer-use-sdk) and published to npm as ${site.packageName}. Provider cloud services may still require their own paid plans.`,
  },
] as const;

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: readonly string[];
};

export const pages = {
  home: {
    title: "Computer Use SDK - one API for every computer-use stack",
    description:
      "One TypeScript API for computer-use, browser agents, desktops, and scrape. createSession and session.run across 16 providers — OpenAI, Anthropic, Browserbase, Playwright, and more.",
    path: "/",
    keywords: seoKeywords,
  },
  docs: {
    title: "Docs - quickstart, providers, and action matrix",
    description:
      "Install Computer Use SDK, run your first session, and browse the full provider capability matrix for browser, desktop, vision, and scrape adapters.",
    path: "/docs",
    keywords: [
      "computer use SDK docs",
      "createSession quickstart",
      "browser agent providers",
      "computer-use matrix",
    ],
  },
  faq: {
    title: "FAQ - Computer Use & Browser Use SDK",
    description:
      "Answers about Computer Use SDK: providers, install, browser-use vs computer-use, open source license, and swapping adapters without rewriting sessions.",
    path: "/faq",
    keywords: [
      "computer use SDK FAQ",
      "browser use SDK FAQ",
      "computer-use TypeScript questions",
    ],
  },
} as const satisfies Record<string, PageSeo>;

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const base = site.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? base : `${base}${p}`;
}

export function buildMetadata(page: PageSeo) {
  const url = absoluteUrl(page.path);
  return {
    title: page.title,
    description: page.description,
    keywords: [...(page.keywords ?? seoKeywords)],
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: site.name,
      type: "website" as const,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: page.title,
      description: page.description,
      images: ["/og.png"],
    },
  };
}

/** JSON-LD graph for the marketing site (SoftwareApplication + FAQ + WebSite). */
export function marketingJsonLd() {
  const providerNames = stripProviders.map((p) => p.name);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo: absoluteUrl("/brand/mark.png"),
        sameAs: [site.github, site.npm],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${site.url}/#software`,
        name: site.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Cross-platform",
        description: site.description,
        url: site.url,
        downloadUrl: site.npm,
        installUrl: site.npm,
        softwareVersion: "0.1.0",
        license: "https://opensource.org/licenses/MIT",
        author: { "@id": `${site.url}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        keywords: seoKeywords.join(", "),
        featureList: [
          "Unified createSession and session.run API",
          `${site.providers} provider adapters`,
          "Browser automation and computer-use agents",
          "Desktop sandboxes, vision, and scrape",
          "Tree-shakeable provider entry points",
          ...providerNames.map((n) => `${n} adapter`),
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${site.url}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: site.url,
          },
        ],
      },
    ],
  };
}

export function docsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: pages.docs.title,
    description: pages.docs.description,
    url: absoluteUrl("/docs"),
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
      logo: { "@type": "ImageObject", url: absoluteUrl("/brand/mark.png") },
    },
    mainEntityOfPage: absoluteUrl("/docs"),
    inLanguage: "en-US",
  };
}

export function faqPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    headline: pages.faq.title,
    description: pages.faq.description,
    url: absoluteUrl("/faq"),
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Routes included in sitemap.xml */
export const sitemapRoutes = [
  { path: "/", priority: 1, changefreq: "weekly" as const },
  { path: "/docs", priority: 0.9, changefreq: "weekly" as const },
  { path: "/faq", priority: 0.7, changefreq: "monthly" as const },
];
