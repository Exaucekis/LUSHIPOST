import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  role: z.enum([Role.SUPER_ADMIN, Role.REDACTEUR_EN_CHEF, Role.JOURNALISTE, Role.EDITEUR, Role.MODERATEUR, Role.VIDEOASTE, Role.ABONNE] as [string, ...string[]]).optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "users:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, image: true, bio: true, createdAt: true, updatedAt: true,
      articles: { select: { id: true, title: true, status: true, updatedAt: true, rejectionReason: true }, orderBy: { updatedAt: "desc" }, take: 30 },
      _count: { select: { notifications: { where: { isRead: false } }, articles: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "users:update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    const data = updateSchema.parse(await request.json());
    if (id === session.user.id && data.isActive === false) return NextResponse.json({ error: "Vous ne pouvez pas désactiver votre propre compte" }, { status: 400 });
    if (data.role === Role.SUPER_ADMIN && session.user.role !== Role.SUPER_ADMIN) return NextResponse.json({ error: "Rôle réservé au Super Admin" }, { status: 403 });
    const user = await prisma.user.update({ where: { id }, data: { ...data, role: data.role as Role | undefined, email: data.email?.toLowerCase().trim() }, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
    await prisma.auditLog.create({ data: { action: "UPDATE", entity: "User", entityId: id, userId: session.user.id, details: data } });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Impossible de modifier cet utilisateur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "users:delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  if (id === session.user.id) return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  if (user.role === Role.SUPER_ADMIN && session.user.role !== Role.SUPER_ADMIN) return NextResponse.json({ error: "Compte réservé au Super Admin" }, { status: 403 });
  await prisma.user.delete({ where: { id } });
  await prisma.auditLog.create({ data: { action: "DELETE", entity: "User", entityId: id, userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
