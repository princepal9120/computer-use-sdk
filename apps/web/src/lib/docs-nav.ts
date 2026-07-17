export type NavLeaf = { label: string; href: string; external?: boolean };

export type NavGroup = { title: string; items: NavLeaf[] };

const G = "https://github.com/princepal9120/computer-use-sdk#";

export const docsNav: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { label: "Overview", href: "/docs" },
      { label: "Quickstart", href: "#quickstart" },
      { label: "Install", href: "#install" },
      { label: "Peers", href: "#peers", external: true },
    ],
  },
  {
    title: "Providers",
    items: [
      { label: "Cloud / model SDKs", href: "#cloud" },
      { label: "OSS / agent frameworks", href: "#oss" },
      { label: "Local & Firecrawl", href: "#transports" },
      { label: "Full matrix", href: "#matrix" },
    ],
  },
  {
    title: "Concepts",
    items: [
      { label: "Adapters", href: "#why" },
      { label: "Fallbacks", href: "#why" },
      { label: "Hooks", href: "#beyond-the-core" },
    ],
  },
  {
    title: "Reference",
    items: [
      { label: "GitHub", href: "https://github.com/princepal9120/computer-use-sdk", external: true },
      { label: "npm", href: "https://www.npmjs.com/package/@prince/computer-use-sdk", external: true },
    ],
  },
];

export type FlatItem = {
  label: string;
  href: string;
  group: string;
  external?: boolean;
};

export const flatNav: FlatItem[] = docsNav.flatMap((g) =>
  g.items.map((i) => ({
    label: i.label,
    href: i.href,
    group: g.title,
    external: i.external,
  }))
);