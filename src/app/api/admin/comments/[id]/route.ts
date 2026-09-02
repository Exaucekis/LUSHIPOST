import { CommentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import prisma from "@/lib/prisma";

const schema = z.object({ status: z.enum([CommentStatus.APPROUVE, CommentStatus.SIGNALE, CommentStatus.SUPPRIME]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !hasPermission(session.user.role, "comments:moderate")) return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  try {
    const { id } = await params;
    const { status } = schema.parse(await request.json());
    const comment = await prisma.comment.update({ where: { id }, data: { status }, select: { id: true, status: true } });
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? "Statut invalide." : "Commentaire introuvable." }, { status: 400 });
  }
}
