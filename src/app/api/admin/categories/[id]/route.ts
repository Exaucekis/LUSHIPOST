import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };
const schema = z.object({ name: z.string().trim().min(2).max(80).optional(), description: z.string().trim().max(500).nullable().optional(), order: z.number().int().min(0).max(999).optional() });

function permitted(role: string) { return hasPermission(role, "categories:manage"); }

export async function PATCH(request: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session || !permitted(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    const category = await prisma.category.update({ where: { id }, data: schema.parse(await request.json()) });
    await prisma.auditLog.create({ data: { action: "UPDATE", entity: "Category", entityId: id, userId: session.user.id } });
    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Impossible de modifier la catégorie" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const session = await getServerSession(authOptions);
  if (!session || !permitted(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const category = await prisma.category.findUnique({ where: { id }, select: { _count: { select: { articles: true, children: true } } } });
  if (!category) return NextResponse.json({ error: "Catégorie introuvable" }, { status: 404 });
  if (category._count.articles || category._count.children) return NextResponse.json({ error: "Cette catégorie contient des publications ou des sous-catégories" }, { status: 409 });
  await prisma.category.delete({ where: { id } });
  await prisma.auditLog.create({ data: { action: "DELETE", entity: "Category", entityId: id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
