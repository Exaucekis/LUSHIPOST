import { ArticleStatus, CommentStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const commentSchema = z.object({
  content: z.string().trim().min(3, "Le commentaire doit contenir au moins 3 caractères.").max(2_000, "Le commentaire est trop long."),
});

async function publishedArticle(id: string) {
  return prisma.article.findFirst({
    where: {
      id,
      status: ArticleStatus.PUBLIE,
      AND: [{ OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }] }],
    },
    select: { id: true },
  });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!(await publishedArticle(id))) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  const [likeCount, comments, liked] = await Promise.all([
    prisma.articleLike.count({ where: { articleId: id } }),
    prisma.comment.findMany({ where: { articleId: id, status: CommentStatus.APPROUVE }, select: { id: true, content: true, createdAt: true, user: { select: { name: true } }, authorName: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    session?.user?.id ? prisma.articleLike.findUnique({ where: { articleId_userId: { articleId: id, userId: session.user.id } }, select: { articleId: true } }) : null,
  ]);
  return NextResponse.json({ likeCount, liked: Boolean(liked), comments: comments.map((comment) => ({ id: comment.id, content: comment.content, createdAt: comment.createdAt, author: comment.user?.name || comment.authorName || "Lecteur" })) });
}

export async function PUT(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Connectez-vous pour aimer cet article." }, { status: 401 });
  if (!(await publishedArticle(id))) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  const where = { articleId_userId: { articleId: id, userId: session.user.id } };
  const current = await prisma.articleLike.findUnique({ where });
  if (current) await prisma.articleLike.delete({ where });
  else await prisma.articleLike.create({ data: { articleId: id, userId: session.user.id } });
  return NextResponse.json({ liked: !current, likeCount: await prisma.articleLike.count({ where: { articleId: id } }) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Connectez-vous pour commenter." }, { status: 401 });
  if (!(await publishedArticle(id))) return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  try {
    const { content } = commentSchema.parse(await request.json());
    await prisma.comment.create({ data: { articleId: id, userId: session.user.id, authorName: session.user.name, authorEmail: session.user.email, content } });
    return NextResponse.json({ message: "Merci. Votre commentaire sera publié après modération." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof z.ZodError ? error.errors[0]?.message : "Impossible d’envoyer le commentaire." }, { status: 400 });
  }
}
