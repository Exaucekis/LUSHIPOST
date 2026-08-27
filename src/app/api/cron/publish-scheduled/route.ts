import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { statusHistoryEntry } from "@/lib/article-status-history";

// Exécuté par le cron Vercel. Une publication programmée reste invisible tant
// que l'heure choisie n'est pas atteinte, même après approbation.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  if (!secret) return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  if (authorization !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const due = await prisma.article.findMany({
    where: { status: ArticleStatus.PROGRAMME, scheduledAt: { lte: new Date() } },
    select: { id: true },
  });
  if (!due.length) return NextResponse.json({ published: 0 });

  await prisma.$transaction([
    prisma.article.updateMany({
      where: { id: { in: due.map(({ id }) => id) }, status: ArticleStatus.PROGRAMME },
      data: { status: ArticleStatus.PUBLIE, publishedAt: new Date() },
    }),
    prisma.articleStatusHistory.createMany({
      data: due.map(({ id }) => statusHistoryEntry(id, ArticleStatus.PROGRAMME, ArticleStatus.PUBLIE, null)),
    }),
  ]);
  return NextResponse.json({ published: due.length });
}
