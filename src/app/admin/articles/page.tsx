import Link from "next/link";
import prisma from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";
import { ArticleStatus } from "@prisma/client";

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const validStatus = status && Object.values(ArticleStatus).includes(status as ArticleStatus) ? status as ArticleStatus : undefined;
  const articles = await prisma.article.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  }).catch(() => []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-lp-gray">{articles.length} publication{articles.length > 1 ? "s" : ""}{validStatus ? ` · ${STATUS_LABELS[validStatus]}` : ""}</p>
        </div>
        <Link href="/admin/articles/new" className="lp-btn-accent">
          + Nouvel article
        </Link>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/articles" className="border px-3 py-1.5 hover:border-lp-accent">Toutes</Link>
        <Link href="/admin/articles?status=EN_REVISION" className="border px-3 py-1.5 hover:border-lp-accent">À valider</Link>
        <Link href="/admin/articles?status=PUBLIE" className="border px-3 py-1.5 hover:border-lp-accent">Publiées</Link>
        <Link href="/admin/articles?status=REFUSE" className="border px-3 py-1.5 hover:border-lp-accent">Refusées</Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-lp-gray">
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Auteur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Vues</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="max-w-xs truncate px-4 py-3 font-medium">{article.title}</td>
                <td className="px-4 py-3">{article.category.name}</td>
                <td className="px-4 py-3">{article.author?.name || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    article.status === "PUBLIE" ? "bg-green-100 text-green-800" :
                    article.status === "BROUILLON" ? "bg-gray-100 text-gray-600" :
                    article.status === "EN_REVISION" ? "bg-yellow-100 text-yellow-800" :
                    article.status === "REFUSE" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {STATUS_LABELS[article.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{article.viewCount}</td>
                <td className="px-4 py-3 text-lp-gray">
                  {article.publishedAt
                    ? formatRelativeDate(article.publishedAt)
                    : formatRelativeDate(article.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="text-lp-accent hover:underline"
                  >
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
