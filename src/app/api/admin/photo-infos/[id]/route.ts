import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canManageArticlePhotos } from "@/lib/permissions";
import { photoInfoSchema } from "@/lib/photo-info-schema";

type Context = { params: Promise<{ id: string }> };
async function allowed() { const session = await getServerSession(authOptions); return !!session && canManageArticlePhotos(session.user.role); }

export async function PATCH(request: Request, context: Context) {
  if (!(await allowed())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = photoInfoSchema.parse(await request.json());
    const { id } = await context.params;
    const item = await prisma.photoInfo.update({ where: { id }, data: { ...data, content: data.content || null, isActive: data.isActive ?? true } });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.errors[0].message : "Mise à jour impossible" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  if (!(await allowed())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  await prisma.photoInfo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
