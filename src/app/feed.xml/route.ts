import { getSiteUrl } from "@/lib/utils";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function GET() {
  let articles: { title: string; slug: string; excerpt: string | null; publishedAt: Date | null }[] = [];

  try {
    articles = await prisma.article.findMany({
      where: { status: "PUBLIE" },
      select: { title: true, slug: true, excerpt: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    });
  } catch {
    /* DB unavailable */
  }

  const baseUrl = getSiteUrl();
  const now = new Date().toUTCString();

  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/article/${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}/article/${a.slug}</guid>
      <description><![CDATA[${a.excerpt || ""}]]></description>
      <pubDate>${a.publishedAt?.toUTCString() || now}</pubDate>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${baseUrl}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>fr</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
