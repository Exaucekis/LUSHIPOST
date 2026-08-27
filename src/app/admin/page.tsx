import Link from "next/link";
import { getAdminStats } from "@/lib/data/articles";
import prisma from "@/lib/prisma";
import { formatRelativeDate } from "@/lib/utils";
import { STATUS_LABELS, SITE_NAME } from "@/lib/constants";

export default async function AdminDashboard() {
  let dbError = false;
  const stats = await getAdminStats().catch(() => {
    dbError = true;
    return {
      articlesToday: 0,
      totalViews: 0,
      subscribers: 0,
      drafts: 0,
      pending: 0,
      scheduled: 0,
      published: 0,
      videos: 0,
      users: 0,
      journalists: 0,
      refused: 0,
      featured: 0,
    };
  });

  const recentArticles = await prisma.article
    .findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { category: true, author: true },
    })
    .catch(() => []);

  const overviewCards = [
    { label: "Utilisateurs", value: stats.users, accent: true },
    { label: "Journalistes", value: stats.journalists },
    { label: "Publications", value: stats.published + stats.pending + stats.drafts + stats.refused },
    { label: "À la une", value: stats.featured },
  ];

  const workflowCards = [
    { label: "Brouillons", value: stats.drafts, href: "/admin/articles?status=BROUILLON" },
    { label: "À valider", value: stats.pending, href: "/admin/articles?status=EN_REVISION" },
    { label: "Refusées", value: stats.refused, href: "/admin/articles?status=REFUSE" },
    { label: "Publiées", value: stats.published, href: "/admin/articles?status=PUBLIE" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">{SITE_NAME} Newsroom</h1>
        <p className="mt-1 text-sm text-lp-gray sm:text-base">Tableau de bord éditorial</p>
      </header>

      {dbError && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Impossible de charger les statistiques depuis la base de données. Les chiffres affichés peuvent être incomplets.
        </div>
      )}

      <section className="mb-8">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-lp-gray">Vue d&apos;ensemble</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-lg border bg-white p-5 ${
                card.accent ? "border-lp-accent" : "border-gray-200"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">{card.label}</p>
              <p className={`mt-2 text-3xl font-black ${card.accent ? "text-lp-accent" : ""}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-lp-gray">Production éditoriale</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {workflowCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-lp-accent/40 hover:bg-gray-50"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">{card.label}</p>
              <p className="mt-2 text-3xl font-black">{card.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="font-bold">Dernières activités</h2>
          <Link href="/admin/articles" className="text-sm font-semibold text-lp-accent hover:underline">
            Voir tous les articles
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-lp-gray">
            Aucun article pour le moment.{" "}
            <Link href="/admin/articles/new" className="font-semibold text-lp-accent hover:underline">
              Créer un article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wider text-lp-gray">
                  <th className="px-4 py-3 sm:px-6">Titre</th>
                  <th className="px-4 py-3 sm:px-6">Catégorie</th>
                  <th className="px-4 py-3 sm:px-6">Statut</th>
                  <th className="px-4 py-3 sm:px-6">Vues</th>
                  <th className="px-4 py-3 sm:px-6">Modifié</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="max-w-xs truncate px-4 py-3 font-medium sm:px-6">
                      <Link href={`/admin/articles/${article.id}`} className="hover:text-lp-accent">
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-lp-gray sm:px-6">{article.category.name}</td>
                    <td className="px-4 py-3 sm:px-6">
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold">
                        {STATUS_LABELS[article.status] || article.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6">{article.viewCount}</td>
                    <td className="px-4 py-3 text-lp-gray sm:px-6">
                      {formatRelativeDate(article.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
