import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Computer Use SDK — one API for browsers, desktops, and scrape",
  description:
    "TypeScript SDK: Local, Browserbase, Browser Use, CUA, Firecrawl. Plug providers in and out.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
