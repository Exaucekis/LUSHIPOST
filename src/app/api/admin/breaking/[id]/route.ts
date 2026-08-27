import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { canManageBreaking } from "@/lib/permissions";
import prisma from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(5).max(180).optional(),
  url: z.string().trim().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).max(99).optional(),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
});

async function authorize() {
  const session = await getServerSession(authOptions);
  return session && canManageBreaking(session.user.role);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 });
  try {
    const data = updateSchema.parse(await request.json());
    const { id } = await params;
    const item = await prisma.breakingNews.update({
      where: { id },
      data: {
        ...data,
        ...(data.url !== undefined ? { url: data.url || null } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null } : {}),
      },
    });
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.errors[0].message : "Modification impossible" }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 });
  const { id } = await params;
  await prisma.breakingNews.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
