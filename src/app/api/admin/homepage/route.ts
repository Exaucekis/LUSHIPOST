import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slots = await prisma.homepageSlot.findMany({
    include: {
      article: {
        select: { id: true, title: true, slug: true, status: true },
      },
    },
    orderBy: [{ slot: "asc" }, { order: "asc" }],
  });

  const articles = await prisma.article.findMany({
    where: { status: "PUBLIE" },
    select: { id: true, title: true, slug: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ slots, articles });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(session.user.role, "homepage:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slot, articleId, order } = await request.json();

  await prisma.homepageSlot.upsert({
    where: { slot_order: { slot, order: order ?? 0 } },
    update: { articleId },
    create: { slot, articleId, order: order ?? 0 },
  });

  return NextResponse.json({ success: true });
}
