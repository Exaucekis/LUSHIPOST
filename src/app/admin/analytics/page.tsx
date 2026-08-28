import { getAdminStats } from "@/lib/data/articles";
import prisma from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { AnalyticsTrendChart } from "@/components/admin/AnalyticsTrendChart";

const ANALYTICS_TIME_ZONE = "Africa/Lubumbashi";

function makeTrendData(views: { createdAt: Date }[]) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    timeZone: ANALYTICS_TIME_ZONE,
    day: "2-digit",
    month: "short",
  });
  const keyFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ANALYTICS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const counts = new Map<string, number>();
  for (const view of views) {
    const key = keyFormatter.format(view.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: 14 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - offset));
    const key = keyFormatter.format(date);
    return { label: formatter.format(date).replace(".", ""), value: counts.get(key) ?? 0 };
  });
}

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

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 13);
  periodStart.setHours(0, 0, 0, 0);
  const recentViews = await prisma.articleView
    .findMany({ where: { createdAt: { gte: periodStart } }, select: { createdAt: true } })
    .catch(() => []);
  const trendData = makeTrendData(recentViews);

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

      <div className="mb-6">
        <AnalyticsTrendChart data={trendData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-bold">Top articles</h2>
          {popular.length === 0 ? (
            <p className="text-sm text-lp-gray">Aucun article publié pour le moment.</p>
          ) : (
            <ol className="space-y-3">
              {popular.map((article, i) => (
                <li key={article.id} className="flex min-w-0 gap-3">
                  <span className="font-black text-lp-accent/30">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="break-words text-sm font-medium">{article.title}</p>
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
                  <li key={stat.categoryId} className="flex min-w-0 flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
                    <span className="min-w-0 break-words">{catMap[stat.categoryId] || "—"}</span>
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
