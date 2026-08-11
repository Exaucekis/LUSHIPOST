import Link from "next/link";
import prisma from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  }).catch(() => []);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-lp-gray">{articles.length} articles au total</p>
        </div>
        <Link href="/admin/articles/new" className="lp-btn-accent">
          + Nouvel article
        </Link>
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
