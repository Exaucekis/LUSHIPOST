import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { canManageBreaking } from "@/lib/permissions";
import prisma from "@/lib/prisma";

const breakingSchema = z.object({
  title: z.string().trim().min(5).max(180),
  url: z.string().trim().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).max(99).default(0),
  expiresAt: z.string().datetime().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageBreaking(session.user.role)) {
    return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 });
  }

  try {
    const data = breakingSchema.parse(await request.json());
    const item = await prisma.breakingNews.create({
      data: {
        title: data.title,
        url: data.url || null,
        isActive: data.isActive,
        order: data.order,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.errors[0].message : "Création impossible" }, { status: 400 });
  }
}
