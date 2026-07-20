import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools-directory";

/**
 * Dynamic sitemap covering every real route: static/tool pages (including
 * "coming soon" ones — still worth crawling), train pages, station pages,
 * and blog pages.
 *
 * Next.js sitemap.ts supports at most 50,000 URLs per file. Once train +
 * station + blog counts approach that limit, split this into a sitemap
 * index by exporting `generateSitemaps()` alongside `sitemap({ id })` —
 * Next.js then serves /sitemap/0.xml, /sitemap/1.xml, etc. automatically.
 * Not needed yet at this scale.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const trains = await prisma.train.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });

  const stations = await prisma.station.findMany({
    select: { code: true },
    orderBy: { name: "asc" },
    take: 500,
  });

  const posts = await prisma.blogPost.findMany({
    select: { slug: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    ...TOOLS.map((tool) => ({
      url: `${SITE_URL}${tool.href}`,
      changeFrequency: "weekly" as const,
      priority: tool.status === "live" ? 0.9 : 0.5,
    })),
  ];

  const trainRoutes: MetadataRoute.Sitemap = trains.map((train) => ({
    url: `${SITE_URL}/train/${train.slug}`,
    lastModified: train.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const stationRoutes: MetadataRoute.Sitemap = stations.map((station) => ({
    url: `${SITE_URL}/station/${station.code}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...trainRoutes, ...stationRoutes, ...blogRoutes];
}
