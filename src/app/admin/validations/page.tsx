import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canPublish } from "@/lib/permissions";
import { formatRelativeDate } from "@/lib/utils";

export default async function ValidationsPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !canPublish(session.user.role)) redirect("/admin");
  const { notice } = await searchParams;

  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.EN_REVISION, user: { role: "JOURNALISTE" } },
    include: { category: true, user: true },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Validations</h1>
        <p className="mt-1 text-lp-gray">Publications soumises par les journalistes, en attente de décision.</p>
      </div>
      {notice && <p className="mb-5 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{notice}</p>}

      {articles.length === 0 ? (
        <div className="lp-panel p-8 text-sm text-lp-gray">Aucune publication journaliste à valider pour le moment.</div>
      ) : (
        <div className="lp-table-scroll rounded-lg border border-gray-200 bg-white">
          <table className="min-w-[680px] text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-lp-gray"><th className="px-4 py-3">Titre</th><th className="px-4 py-3">Journaliste</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Soumis</th><th className="px-4 py-3">Action</th></tr></thead>
            <tbody>{articles.map((article) => (
              <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="max-w-xs truncate px-4 py-3 font-medium">{article.title}</td>
                <td className="px-4 py-3">{article.user?.name || article.user?.email || "—"}</td>
                <td className="px-4 py-3">{article.category.name}</td>
                <td className="px-4 py-3 text-lp-gray">{formatRelativeDate(article.submittedAt || article.updatedAt)}</td>
                <td className="px-4 py-3"><Link href={`/admin/validations/${article.id}`} className="font-semibold text-lp-accent hover:underline">Examiner</Link></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
