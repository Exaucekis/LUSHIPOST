import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { z } from "zod";

const slotSchema = z.object({ slot: z.enum(["hero_main", "hero_secondary"]), articleId: z.string().cuid(), order: z.number().int().min(0).max(10) });
const removeSlotSchema = z.object({ slot: z.enum(["hero_main", "hero_secondary"]), order: z.number().int().min(0).max(10) });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(session.user.role, "homepage:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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

  try {
    const { slot, articleId, order } = slotSchema.parse(await request.json());
    const article = await prisma.article.findFirst({ where: { id: articleId, status: "PUBLIE" }, select: { id: true } });
    if (!article) return NextResponse.json({ error: "Seules les publications approuvées peuvent être mises à la une" }, { status: 400 });

    await prisma.$transaction([
      prisma.homepageSlot.upsert({
        where: { slot_order: { slot, order } },
        update: { articleId },
        create: { slot, articleId, order },
      }),
      prisma.article.update({ where: { id: articleId }, data: { isFeatured: true } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Impossible de mettre à jour la UNE" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "homepage:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { slot, order } = removeSlotSchema.parse(await request.json());
    const existing = await prisma.homepageSlot.findUnique({ where: { slot_order: { slot, order } }, select: { articleId: true } });
    if (!existing) return NextResponse.json({ success: true });
    await prisma.$transaction(async (tx) => {
      await tx.homepageSlot.delete({ where: { slot_order: { slot, order } } });
      if (await tx.homepageSlot.count({ where: { articleId: existing.articleId } }) === 0) {
        await tx.article.update({ where: { id: existing.articleId }, data: { isFeatured: false } });
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Impossible de retirer cette publication de la UNE" }, { status: 500 });
  }
}
