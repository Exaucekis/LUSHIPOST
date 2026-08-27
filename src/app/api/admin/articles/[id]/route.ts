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

type RouteContext = { params: Promise<{ id: string }> };

async function canEditArticle(
  role: string,
  userId: string,
  articleUserId: string | null
) {
  if (hasPermission(role, "articles:update")) return true;
  if (hasPermission(role, "articles:update:own") && articleUserId === userId) {
    return true;
  }
  return false;
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { category: true, author: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  if (!canEditArticle(session.user.role, session.user.id, article.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ article });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const existing = await prisma.article.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  if (!canEditArticle(session.user.role, session.user.id, existing.userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = articleFormSchema.parse(body);
    const status = (data.status as ArticleStatus) || existing.status;
    const canPublishNow = hasPermission(session.user.role, "articles:publish");

    if (status === ArticleStatus.PUBLIE && !canPublishNow) {
      return NextResponse.json({ error: "Permission de publication requise" }, { status: 403 });
    }

    const willPublish = status === ArticleStatus.PUBLIE;

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug || existing.slug || slugifyTitle(data.title),
        subtitle: data.subtitle || null,
        excerpt: data.excerpt || null,
        content: data.content,
        categoryId: data.categoryId,
        status,
        contentType: (data.contentType as ContentType) || existing.contentType,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        geoZone: data.geoZone || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        publishedAt: willPublish
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      },
    });

    if (existing.status !== status) {
      await prisma.articleStatusHistory.create({
        data: statusHistoryEntry(article.id, existing.status, status, session.user.id),
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Article",
        entityId: article.id,
        userId: session.user.id,
        details: { title: article.title, status: article.status },
      },
    });

    return NextResponse.json({ id: article.id, slug: article.slug });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "articles:delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  await prisma.article.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "Article",
      entityId: id,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
