import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
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
    return NextResponse.json({ liked: false, count: 0 }, { status: 200 });
  }

  const session = await getServerSession(authOptions);
  const [count, liked] = await Promise.all([
    prisma.articleLike.count({ where: { articleId: article.id } }),
    session?.user?.id
      ? prisma.articleLike.findUnique({
          where: {
            articleId_userId: { articleId: article.id, userId: session.user.id },
          },
        })
      : Promise.resolve(null),
  ]);

  return NextResponse.json({ liked: !!liked, count });
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Connexion requise pour aimer cet article." }, { status: 401 });
  }

  const { slug } = await context.params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });

  if (!article || article.status !== "PUBLIE") {
    return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  }

  const existingLike = await prisma.articleLike.findUnique({
    where: {
      articleId_userId: { articleId: article.id, userId: session.user.id },
    },
  });

  if (existingLike) {
    await prisma.articleLike.delete({
      where: { id: existingLike.id },
    });
    const count = await prisma.articleLike.count({ where: { articleId: article.id } });
    return NextResponse.json({ liked: false, count });
  }

  await prisma.articleLike.create({
    data: {
      articleId: article.id,
      userId: session.user.id,
    },
  });

  const count = await prisma.articleLike.count({ where: { articleId: article.id } });
  return NextResponse.json({ liked: true, count });
}
