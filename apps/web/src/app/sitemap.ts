import type { MetadataRoute } from "next";
import { absoluteUrl, sitemapRoutes } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}
