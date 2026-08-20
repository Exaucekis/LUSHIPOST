import { getAdminStats } from "@/lib/data/articles";
import prisma from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";

export default async function AdminAnalyticsPage() {
  let dbError = false;

  const stats = await getAdminStats().catch(() => {
    dbError = true;
    return null;
  });

  const popular = await prisma.article
    .findMany({
      where: {
        status: ArticleStatus.PUBLIE,
        publishedAt: { lte: new Date() },
      },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { id: true, title: true, viewCount: true },
    })
    .catch(() => []);

  const categoryStats = await prisma.article
    .groupBy({
      by: ["categoryId"],
      _count: { id: true },
      _sum: { viewCount: true },
      where: { status: ArticleStatus.PUBLIE },
    })
    .catch(() => []);

  const categories = await prisma.category.findMany().catch(() => []);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Statistiques</h1>
      <p className="mb-8 text-sm text-lp-gray">Données issues de la base de données en temps réel.</p>

      {dbError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Impossible de charger certaines statistiques depuis la base de données.
        </div>
      )}

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Pages vues</p>
            <p className="mt-2 text-3xl font-black">{stats.totalViews.toLocaleString("fr-FR")}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Articles publiés</p>
            <p className="mt-2 text-3xl font-black">{stats.published}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Abonnés</p>
            <p className="mt-2 text-3xl font-black">{stats.subscribers}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Publiés aujourd&apos;hui</p>
            <p className="mt-2 text-3xl font-black">{stats.articlesToday}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Top articles</h2>
          {popular.length === 0 ? (
            <p className="text-sm text-lp-gray">Aucun article publié pour le moment.</p>
          ) : (
            <ol className="space-y-3">
              {popular.map((article, i) => (
                <li key={article.id} className="flex gap-3">
                  <span className="font-black text-lp-accent/30">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="text-sm font-medium">{article.title}</p>
                    <p className="text-xs text-lp-gray">
                      {article.viewCount.toLocaleString("fr-FR")} vues
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Top catégories</h2>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-lp-gray">Aucune donnée de catégorie disponible.</p>
          ) : (
            <ul className="space-y-3">
              {categoryStats
                .sort((a, b) => (b._sum.viewCount ?? 0) - (a._sum.viewCount ?? 0))
                .map((stat) => (
                  <li key={stat.categoryId} className="flex justify-between gap-4 text-sm">
                    <span>{catMap[stat.categoryId] || "—"}</span>
                    <span className="text-right text-lp-gray">
                      {stat._count.id} articles · {(stat._sum.viewCount ?? 0).toLocaleString("fr-FR")} vues
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
