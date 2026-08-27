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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isJournalistRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const articles = await prisma.article.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isJournalistRole(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = articleFormSchema.parse(await request.json());
    const submitted = data.status === "EN_REVISION";
    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle || null,
        excerpt: data.excerpt || null,
        content: data.content,
        categoryId: data.categoryId,
        contentType: (data.contentType as ContentType) || ContentType.FAITS,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        geoZone: data.geoZone || null,
        status: submitted ? ArticleStatus.EN_REVISION : ArticleStatus.BROUILLON,
        submittedAt: submitted ? new Date() : null,
        userId: session.user.id,
      },
    });
    await prisma.articleStatusHistory.create({
      data: statusHistoryEntry(article.id, null, article.status, session.user.id),
    });
    if (submitted) await notifyModerators(article.id, article.title);
    return NextResponse.json({ id: article.id, slug: article.slug }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Impossible d'enregistrer la publication" }, { status: 500 });
  }
}
