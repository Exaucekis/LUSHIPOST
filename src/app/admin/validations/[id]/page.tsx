import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canPublish } from "@/lib/permissions";
import { ModerationPanel } from "@/components/admin/ModerationPanel";

export default async function ValidationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !canPublish(session.user.role)) redirect("/admin");

  const { id } = await params;
  const article = await prisma.article.findFirst({
    where: { id, status: ArticleStatus.EN_REVISION, user: { role: "JOURNALISTE" } },
    include: { category: true, user: true },
  });
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/validations" className="text-sm font-semibold text-lp-accent hover:underline">← Retour aux validations</Link>
      <header className="mt-5 border-b pb-6">
        <p className="lp-category-badge">{article.category.name}</p>
        <h1 className="mt-3 text-3xl font-bold">{article.title}</h1>
        <p className="mt-2 text-sm text-lp-gray">Soumis par {article.user?.name || article.user?.email || "un journaliste"}</p>
        {article.subtitle && <p className="mt-4 text-lg text-lp-gray">{article.subtitle}</p>}
      </header>
      <ModerationPanel articleId={article.id} returnPath="/admin/validations" />
      {article.excerpt && <p className="mt-8 border-l-4 border-lp-accent bg-lp-accent-soft px-5 py-4 font-medium">{article.excerpt}</p>}
      <article className="lp-prose mt-8" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}
