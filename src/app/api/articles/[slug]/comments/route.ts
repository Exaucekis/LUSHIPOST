import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { CommentStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  if (!article || article.status !== "PUBLIE") {
    return NextResponse.json({ comments: [] }, { status: 200 });
  }

  const comments = await prisma.comment.findMany({
    where: {
      articleId: article.id,
      status: CommentStatus.APPROUVE,
    },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    comments: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: comment.user ? { id: comment.user.id, name: comment.user.name } : null,
      authorName: comment.authorName,
    })),
  });
}

export async function POST(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise pour commenter." }, { status: 401 });
  }

  const { slug } = await context.params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  if (!article || article.status !== "PUBLIE") {
    return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  }

  const body = await request.json();
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content || content.length < 2 || content.length > 1000) {
    return NextResponse.json({ error: "Le commentaire doit contenir entre 2 et 1000 caractères." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      articleId: article.id,
      userId: session.user.id,
      content,
      status: CommentStatus.APPROUVE,
      authorName: session.user.name || null,
      authorEmail: session.user.email || null,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      user: comment.user ? { id: comment.user.id, name: comment.user.name } : null,
      authorName: comment.authorName,
    },
  });
}
