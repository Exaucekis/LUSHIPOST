import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { canManageArticlePhotos } from "@/lib/permissions";
import { photoInfoSchema } from "@/lib/photo-info-schema";

async function allowPhotoInfoManagement() {
  const session = await getServerSession(authOptions);
  return session && canManageArticlePhotos(session.user.role);
}

export async function GET() {
  if (!(await allowPhotoInfoManagement())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await prisma.photoInfo.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await allowPhotoInfoManagement())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const data = photoInfoSchema.parse(await request.json());
    const item = await prisma.photoInfo.create({ data: { ...data, content: data.content || null, isActive: data.isActive ?? true } });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.errors[0].message : "Création impossible" }, { status: 400 });
  }
}
