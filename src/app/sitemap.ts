import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";
import { CATEGORY_SLUGS } from "@/lib/constants";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticPages = [
    "",
    ...CATEGORY_SLUGS.map((s) => `/${s}`),
    "/video",
    "/live",
    "/recherche",
    "/a-propos",
    "/contact",
    "/verification",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLIE" },
      select: { slug: true, updatedAt: true },
    });
    articlePages = articles.map((a) => ({
      url: `${baseUrl}/article/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
  } catch {
    /* DB unavailable */
  }

  return [...staticPages, ...articlePages];
}
