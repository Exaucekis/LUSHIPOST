import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { ArticleStatus, ContentType } from "@prisma/client";

import { articleFormSchema } from "@/lib/article-schema";
import { slugifyTitle } from "@/lib/article-schema";
import { statusHistoryEntry } from "@/lib/article-status-history";

const createSchema = articleFormSchema;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  });

  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "articles:create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const status = (data.status as ArticleStatus) || ArticleStatus.BROUILLON;
    const canPublishNow = hasPermission(session.user.role, "articles:publish");

    if (status === ArticleStatus.PUBLIE && !canPublishNow) {
      return NextResponse.json({ error: "Permission de publication requise" }, { status: 403 });
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug || slugifyTitle(data.title),
        subtitle: data.subtitle,
        excerpt: data.excerpt,
        content: data.content,
        categoryId: data.categoryId,
        status,
        contentType: (data.contentType as ContentType) || ContentType.FAITS,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        geoZone: data.geoZone || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        userId: session.user.id,
        publishedAt: status === ArticleStatus.PUBLIE ? new Date() : null,
      },
    });
    await prisma.articleStatusHistory.create({
      data: statusHistoryEntry(article.id, null, article.status, session.user.id),
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Article",
        entityId: article.id,
        userId: session.user.id,
        details: { title: article.title },
      },
    });

    return NextResponse.json({ id: article.id, slug: article.slug }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
