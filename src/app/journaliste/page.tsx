import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { STATUS_LABELS } from "@/lib/constants";
import { VideoSubmissionForm } from "@/components/admin/VideoSubmissionForm";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import { DeleteVideoButton } from "@/components/admin/DeleteVideoButton";

export default async function JournalistDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/connexion?mode=staff&callbackUrl=/journaliste");
  const userId = session.user.id;
  const [articles, notifications, myVideos] = await Promise.all([
    prisma.article.findMany({ where: { userId }, include: { category: true }, orderBy: { updatedAt: "desc" }, take: 20 }),
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.video.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const count = (status: ArticleStatus) => articles.filter((article) => article.status === status).length;

  return (
    <div className="lp-container max-w-7xl py-6 sm:py-10"><div className="lp-dashboard">
      <div className="lp-dashboard-header">
        <div><p className="lp-dashboard-eyebrow">Mon espace rédaction</p><h1 className="text-3xl font-bold sm:text-4xl">Espace journaliste</h1><p className="mt-2 text-lp-gray">Créez, soumettez et suivez vos publications en temps réel.</p></div>
        <Link href="/journaliste/articles/new" className="lp-btn-accent">+ Nouvelle publication</Link>
      </div>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[ ["Brouillons", count(ArticleStatus.BROUILLON)], ["En attente", count(ArticleStatus.EN_REVISION)], ["Programmées", count(ArticleStatus.PROGRAMME)], ["Publiées", count(ArticleStatus.PUBLIE)], ["Refusées", count(ArticleStatus.REFUSE)] ].map(([label, value]) => (
          <div key={String(label)} className="lp-kpi-card"><p className="text-xs font-bold uppercase text-lp-gray">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lp-panel lg:col-span-2">
          <div className="lp-panel-heading"><h2 className="font-bold">Mes publications</h2></div>
          {articles.length === 0 ? <p className="p-6 text-sm text-lp-gray">Aucune publication pour le moment.</p> : (
            <div className="divide-y divide-gray-100">{articles.map((article) => (
              <div key={article.id} className="flex flex-col gap-3 px-4 py-4 hover:bg-gray-50 sm:px-5 sm:flex-row sm:items-start sm:justify-between">
                <Link href={`/journaliste/articles/${article.id}`} className="block min-w-0 flex-1">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{article.title}</p>
                      <p className="mt-1 text-xs text-lp-gray">{article.category.name} · modifié le {article.updatedAt.toLocaleDateString("fr-FR")}</p>
                    </div>
                    <span className="h-fit w-fit shrink-0 rounded bg-gray-100 px-2 py-1 text-xs font-semibold">{STATUS_LABELS[article.status]}</span>
                  </div>
                  {article.status === ArticleStatus.REFUSE && article.rejectionReason && <p className="mt-2 break-words text-sm text-red-700">Motif : {article.rejectionReason}</p>}
                </Link>
                <DeleteArticleButton
                  articleId={article.id}
                  endpoint="/api/journaliste/articles"
                  redirectTo="/journaliste"
                  label="Supprimer"
                />
              </div>
            ))}</div>
          )}
        </section>
        <aside className="lp-panel"><div className="lp-panel-heading"><h2 className="font-bold">Notifications</h2></div><div className="divide-y divide-gray-100">{notifications.length === 0 ? <p className="p-5 text-sm text-lp-gray">Aucune notification.</p> : notifications.map((notification) => <div key={notification.id} className="p-4"><p className="text-sm font-semibold">{notification.title}</p><p className="mt-1 text-xs text-lp-gray">{notification.body}</p></div>)}</div></aside>
      </div></div>
      <div className="mt-8"><VideoSubmissionForm endpoint="/api/journaliste/videos" /></div>
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Mes reportages vidéo</h2>
        </div>
        {myVideos.length === 0 ? (
          <p className="text-sm text-lp-gray">Aucun reportage vidéo pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {myVideos.map((video) => (
              <div key={video.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                <div>
                  <p className="font-medium">{video.title}</p>
                  <p className="text-xs text-lp-gray">{video.publishedAt ? "Publié" : "En attente"}</p>
                </div>
                <div className="flex items-center gap-3">
                  {video.publishedAt && <Link href={`/video/${video.slug}`} className="text-sm text-lp-accent hover:underline">Voir</Link>}
                  <DeleteVideoButton
                    videoId={video.id}
                    endpoint="/api/journaliste/videos"
                    redirectTo="/journaliste"
                    label="Supprimer"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
