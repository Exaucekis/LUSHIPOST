import { ArticleStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  MOCK_ARTICLES,
  MOCK_BREAKING,
  MOCK_CATEGORIES,
  MOCK_VIDEOS,
  MOCK_SOCIAL,
} from "@/lib/mock-data";

const articleInclude = {
  category: true,
  author: true,
  source: true,
  tags: { include: { tag: true } },
} as const;

export async function getPublishedArticles({
  categorySlug,
  limit = 10,
  offset = 0,
  geoZone,
  africaRegion,
  intlRegion,
}: {
  categorySlug?: string;
  limit?: number;
  offset?: number;
  geoZone?: string;
  africaRegion?: string;
  intlRegion?: string;
} = {}) {
  try {
    return await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLIE,
        publishedAt: { lte: new Date() },
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(geoZone && { geoZone }),
        ...(africaRegion && { africaRegion }),
        ...(intlRegion && { intlRegion }),
      },
      include: articleInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  } catch {
    let filtered = [...MOCK_ARTICLES];
    if (categorySlug) filtered = filtered.filter((a) => a.category.slug === categorySlug);
    return filtered.slice(offset, offset + limit);
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: {
        slug,
        status: ArticleStatus.PUBLIE,
        publishedAt: { lte: new Date() },
      },
      include: articleInclude,
    });
  } catch {
    return MOCK_ARTICLES.find((a) => a.slug === slug) ?? null;
  }
}

export async function getPopularArticles(limit = 5) {
  try {
    return await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLIE,
        publishedAt: { lte: new Date() },
      },
      include: articleInclude,
      orderBy: { viewCount: "desc" },
      take: limit,
    });
  } catch {
    return [...MOCK_ARTICLES].sort((a, b) => b.viewCount - a.viewCount).slice(0, limit);
  }
}

export async function getRelatedArticles(
  articleId: string,
  categoryId: string,
  tags: string[],
  limit = 4
) {
  try {
    return await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLIE,
        publishedAt: { lte: new Date() },
        id: { not: articleId },
        OR: [
          { categoryId },
          ...(tags.length > 0
            ? [{ tags: { some: { tag: { slug: { in: tags } } } } }]
            : []),
        ],
      },
      include: articleInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return MOCK_ARTICLES.filter((a) => a.id !== articleId && a.categoryId === categoryId).slice(0, limit);
  }
}

export async function getHomepageHero() {
  try {
    const slots = await prisma.homepageSlot.findMany({
      where: { slot: { in: ["hero_main", "hero_secondary"] } },
      include: { article: { include: articleInclude } },
      orderBy: [{ slot: "asc" }, { order: "asc" }],
    });

    const main = slots.find((s) => s.slot === "hero_main")?.article ?? null;
    const secondary = slots
      .filter((s) => s.slot === "hero_secondary")
      .map((s) => s.article);

    if (!main) {
      const fallback = await getPublishedArticles({ limit: 4 });
      return {
        main: fallback[0] ?? null,
        secondary: fallback.slice(1, 4),
      };
    }

    return { main, secondary };
  } catch {
    return {
      main: MOCK_ARTICLES[0],
      secondary: MOCK_ARTICLES.slice(1, 4),
    };
  }
}

export async function getBreakingNews() {
  try {
    return await prisma.breakingNews.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: { article: true },
      orderBy: { order: "asc" },
      take: 10,
    });
  } catch {
    return MOCK_BREAKING;
  }
}

export async function getLatestArticles(limit = 8) {
  return getPublishedArticles({ limit });
}

export async function getCategoryBySlug(slug: string) {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch {
    return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }
}

export async function getAllCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { order: "asc" } });
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function searchArticles(query: string, type?: string, limit = 20) {
  try {
    if (type === "videos") {
      return await prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { publishedAt: "desc" },
      });
    }

    return await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLIE,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      include: articleInclude,
      take: limit,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    const q = query.toLowerCase();
    return MOCK_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.excerpt?.toLowerCase().includes(q) ?? false)
    ).slice(0, limit);
  }
}

export async function getLiveEvents() {
  try {
    return await prisma.liveEvent.findMany({
      where: { isLive: true },
      include: { article: { include: articleInclude } },
      orderBy: { startedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getVideos(limit = 12) {
  try {
    return await prisma.video.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return MOCK_VIDEOS.slice(0, limit);
  }
}

export async function getSocialLinks() {
  try {
    return await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch {
    return MOCK_SOCIAL;
  }
}

export async function incrementArticleViews(articleId: string) {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    /* mock mode */
  }
}

export async function getAdminStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    articlesToday,
    totalViews,
    subscribers,
    drafts,
    pending,
    scheduled,
    published,
    videos,
  ] = await Promise.all([
    prisma.article.count({
      where: { createdAt: { gte: today }, status: ArticleStatus.PUBLIE },
    }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.newsletterSubscriber.count({ where: { isConfirmed: true } }),
    prisma.article.count({ where: { status: ArticleStatus.BROUILLON } }),
    prisma.article.count({ where: { status: ArticleStatus.EN_REVISION } }),
    prisma.article.count({ where: { status: ArticleStatus.PROGRAMME } }),
    prisma.article.count({ where: { status: ArticleStatus.PUBLIE } }),
    prisma.video.count(),
  ]);

  return {
    articlesToday,
    totalViews: totalViews._sum.viewCount ?? 0,
    subscribers,
    drafts,
    pending,
    scheduled,
    published,
    videos,
  };
}
