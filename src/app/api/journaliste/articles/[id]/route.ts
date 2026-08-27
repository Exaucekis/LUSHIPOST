import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ArticleStatus, ContentType } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { isJournalistRole } from "@/lib/roles";
import prisma from "@/lib/prisma";
import { articleFormSchema } from "@/lib/article-schema";
import { notifyModerators } from "@/lib/editorial-workflow";
import { statusHistoryEntry } from "@/lib/article-status-history";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnArticle(userId: string, id: string) {
  return prisma.article.findFirst({ where: { id, userId }, include: { category: true } });
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !isJournalistRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const article = await getOwnArticle(session.user.id, id);
  if (!article) return NextResponse.json({ error: "Publication introuvable" }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !isJournalistRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await context.params;
    const existing = await getOwnArticle(session.user.id, id);
    if (!existing) return NextResponse.json({ error: "Publication introuvable" }, { status: 404 });
    if (existing.status === ArticleStatus.PUBLIE || existing.status === ArticleStatus.ARCHIVE) {
      return NextResponse.json({ error: "Cette publication ne peut plus être modifiée" }, { status: 409 });
    }

    const data = articleFormSchema.parse(await request.json());
    const submitted = data.status === "EN_REVISION";
    const nextStatus = submitted ? ArticleStatus.EN_REVISION : ArticleStatus.BROUILLON;
    const article = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id },
        data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle || null,
        excerpt: data.excerpt || null,
        content: data.content,
        categoryId: data.categoryId,
        contentType: (data.contentType as ContentType) || existing.contentType,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        geoZone: data.geoZone || null,
        status: nextStatus,
        submittedAt: submitted ? new Date() : existing.submittedAt,
        rejectionReason: submitted ? null : existing.rejectionReason,
        reviewedAt: submitted ? null : existing.reviewedAt,
        reviewedById: submitted ? null : existing.reviewedById,
        },
      });
      if (existing.status !== nextStatus) {
        await tx.articleStatusHistory.create({
          data: statusHistoryEntry(id, existing.status, nextStatus, session.user.id),
        });
      }
      return updated;
    });
    if (submitted) await notifyModerators(article.id, article.title);

    await prisma.auditLog.create({
      data: { action: submitted ? "RESUBMIT" : "UPDATE_DRAFT", entity: "Article", entityId: article.id, userId: session.user.id },
    });
    return NextResponse.json({ id: article.id, slug: article.slug });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
    }
    return NextResponse.json({ error: "Impossible d'enregistrer la publication" }, { status: 500 });
  }
}
