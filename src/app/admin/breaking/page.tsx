import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { canManageBreaking } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { BreakingNewsManager } from "@/components/admin/BreakingNewsManager";

export default async function AdminBreakingPage() {
  const session = await getServerSession(authOptions);
  if (!session || !canManageBreaking(session.user.role)) redirect("/admin");

  const items = await prisma.breakingNews.findMany({
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { order: "asc" },
  }).catch(() => []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dernières informations</h1>
      <p className="mb-6 text-lp-gray">
        Gérez la barre de breaking news affichée en haut du site.
      </p>

      <BreakingNewsManager initialItems={items.map((item) => ({
        id: item.id, title: item.title, url: item.url, isActive: item.isActive,
        order: item.order, expiresAt: item.expiresAt?.toISOString() ?? null,
        articleTitle: item.article?.title ?? null,
      }))} />
    </div>
  );
}
