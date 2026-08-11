import { getAdminStats, getPopularArticles } from "@/lib/data/articles";
import prisma from "@/lib/prisma";

export default async function AdminAnalyticsPage() {
  const stats = await getAdminStats().catch(() => null);
  const popular = await getPopularArticles(10).catch(() => []);

  const categoryStats = await prisma.article.groupBy({
    by: ["categoryId"],
    _count: { id: true },
    _sum: { viewCount: true },
    where: { status: "PUBLIE" },
  }).catch(() => []);

  const categories = await prisma.category.findMany().catch(() => []);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Statistiques</h1>

      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-6">
            <p className="text-xs uppercase text-lp-gray">Pages vues</p>
            <p className="text-3xl font-black">{stats.totalViews.toLocaleString("fr-FR")}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <p className="text-xs uppercase text-lp-gray">Articles publiés</p>
            <p className="text-3xl font-black">{stats.published}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <p className="text-xs uppercase text-lp-gray">Abonnés</p>
            <p className="text-3xl font-black">{stats.subscribers}</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <p className="text-xs uppercase text-lp-gray">Aujourd&apos;hui</p>
            <p className="text-3xl font-black">{stats.articlesToday}</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-bold">Top articles</h2>
          <ol className="space-y-3">
            {popular.map((article, i) => (
              <li key={article.id} className="flex gap-3">
                <span className="font-black text-lp-accent/30">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="text-sm font-medium">{article.title}</p>
                  <p className="text-xs text-lp-gray">{article.viewCount.toLocaleString("fr-FR")} vues</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 font-bold">Top catégories</h2>
          <ul className="space-y-3">
            {categoryStats
              .sort((a, b) => (b._sum.viewCount ?? 0) - (a._sum.viewCount ?? 0))
              .map((stat) => (
                <li key={stat.categoryId} className="flex justify-between text-sm">
                  <span>{catMap[stat.categoryId] || "—"}</span>
                  <span className="text-lp-gray">
                    {stat._count.id} articles · {(stat._sum.viewCount ?? 0).toLocaleString("fr-FR")} vues
                  </span>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
