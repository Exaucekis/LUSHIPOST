import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { notifyJournalist } from "@/lib/editorial-workflow";
import { statusHistoryEntry } from "@/lib/article-status-history";

type RouteContext = { params: Promise<{ id: string }> };

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().min(5, "Le motif de refus doit contenir au moins 5 caractères").max(2000).optional(),
}).superRefine((data, ctx) => {
  if (data.action === "reject" && !data.reason) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"], message: "Le motif de refus est obligatoire" });
  }
});

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session.user.role, "articles:publish")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action, reason } = schema.parse(await request.json());
    const { id } = await context.params;
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    if (existing.status !== ArticleStatus.EN_REVISION) {
      return NextResponse.json({ error: "Seules les publications en attente peuvent être modérées" }, { status: 409 });
    }

    const approved = action === "approve";
    const article = await prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id },
        data: {
        status: approved ? ArticleStatus.PUBLIE : ArticleStatus.REFUSE,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
        rejectionReason: approved ? null : reason!,
        publishedAt: approved ? new Date() : null,
        },
      });
      // L'approbation est enregistrée explicitement, puis la publication
      // immédiate est tracée : seul PUBLIE est exposé au site public.
      if (approved) {
        await tx.articleStatusHistory.createMany({
          data: [
            statusHistoryEntry(id, existing.status, ArticleStatus.APPROUVE, session.user.id),
            statusHistoryEntry(id, ArticleStatus.APPROUVE, ArticleStatus.PUBLIE, session.user.id),
          ],
        });
      } else {
        await tx.articleStatusHistory.create({
          data: statusHistoryEntry(id, existing.status, ArticleStatus.REFUSE, session.user.id, reason),
        });
      }
      return updated;
    });

    await Promise.all([
      prisma.auditLog.create({
        data: {
          action: approved ? "APPROVE_AND_PUBLISH" : "REJECT",
          entity: "Article",
          entityId: article.id,
          userId: session.user.id,
          details: { title: article.title, reason: approved ? undefined : reason },
        },
      }),
      notifyJournalist(article.userId, article.id, article.title, approved, reason),
    ]);

    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la modération" }, { status: 500 });
  }
}
