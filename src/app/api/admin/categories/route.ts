import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().min(0).max(999).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "categories:manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = categorySchema.parse(await request.json());
    const category = await prisma.category.create({ data: { ...data, description: data.description || null } });
    await prisma.auditLog.create({ data: { action: "CREATE", entity: "Category", entityId: category.id, userId: session.user.id } });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Impossible de créer la catégorie" }, { status: 500 });
  }
}
