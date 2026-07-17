import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://computer-use-sdk.vercel.app"),
  title: {
    default: "Computer Use SDK - one API for every computer-use stack",
    template: "%s - Computer Use SDK",
  },
  description:
    "One TypeScript API for computer-use, browser agents, desktops, and scrape. Plug any provider in, swap one import.",
  openGraph: {
    title: "Computer Use SDK - one API for every computer-use stack",
    description:
      "One createSession and session.run across local browsers, cloud agents, desktops, vision, and scrape.",
    url: "https://computer-use-sdk.vercel.app",
    siteName: "Computer Use SDK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Computer Use SDK",
    description: "One API for every computer-use stack.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-[100dvh] antialiased">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}