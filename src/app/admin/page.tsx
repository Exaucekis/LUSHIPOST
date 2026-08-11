import { getAdminStats } from "@/lib/data/articles";
import prisma from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

export default async function AdminDashboard() {
  const stats = await getAdminStats().catch(() => ({
    articlesToday: 0,
    totalViews: 0,
    subscribers: 0,
    drafts: 0,
    pending: 0,
    scheduled: 0,
    published: 0,
    videos: 0,
  }));

  const recentArticles = await prisma.article
    .findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { category: true, author: true },
    })
    .catch(() => []);

  const statCards = [
    { label: "Articles aujourd'hui", value: stats.articlesToday, accent: true },
    { label: "Vues totales", value: stats.totalViews.toLocaleString("fr-FR") },
    { label: "Abonnés newsletter", value: stats.subscribers },
    { label: "Brouillons", value: stats.drafts },
    { label: "En révision", value: stats.pending },
    { label: "Programmés", value: stats.scheduled },
    { label: "Publiés", value: stats.published },
    { label: "Vidéos", value: stats.videos },
  ];

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">LUSHIPOST Newsroom</h1>
        <p className="mt-1 text-lp-gray">Tableau de bord éditorial</p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border bg-white p-6 ${
              card.accent ? "border-lp-accent" : "border-gray-200"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-black ${card.accent ? "text-lp-accent" : ""}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-bold">Dernières activités</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-lp-gray">
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Vues</th>
                <th className="px-6 py-3">Modifié</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((article) => (
                <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="max-w-xs truncate px-6 py-3 font-medium">
                    <a href={`/admin/articles/${article.id}`} className="hover:text-lp-accent">
                      {article.title}
                    </a>
                  </td>
                  <td className="px-6 py-3 text-lp-gray">{article.category.name}</td>
                  <td className="px-6 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold">
                      {STATUS_LABELS[article.status] || article.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{article.viewCount}</td>
                  <td className="px-6 py-3 text-lp-gray">
                    {formatRelativeDate(article.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
