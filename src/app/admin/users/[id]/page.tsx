import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ROLE_LABELS, STATUS_LABELS } from "@/lib/constants";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { articles: { include: { category: true }, orderBy: { updatedAt: "desc" }, take: 30 }, _count: { select: { notifications: { where: { isRead: false } }, articles: true } } },
  }).catch(() => null);
  if (!user) notFound();
  return <div className="max-w-4xl"><Link href="/admin/users" className="text-sm font-semibold text-lp-accent hover:underline">← Utilisateurs</Link><h1 className="mt-4 text-3xl font-bold">{user.name}</h1><p className="mt-1 text-lp-gray">{user.email} · {ROLE_LABELS[user.role] || user.role} · {user.isActive ? "Compte actif" : "Compte désactivé"}</p><div className="mt-6 grid gap-4 sm:grid-cols-3"><div className="border bg-white p-4"><p className="text-xs font-bold uppercase text-lp-gray">Publications</p><p className="mt-2 text-2xl font-black">{user._count.articles}</p></div><div className="border bg-white p-4"><p className="text-xs font-bold uppercase text-lp-gray">Notifications non lues</p><p className="mt-2 text-2xl font-black">{user._count.notifications}</p></div><div className="border bg-white p-4"><p className="text-xs font-bold uppercase text-lp-gray">Inscription</p><p className="mt-2 text-sm font-semibold">{user.createdAt.toLocaleDateString("fr-FR")}</p></div></div><section className="mt-8 overflow-hidden border bg-white"><h2 className="border-b px-5 py-4 font-bold">Publications associées</h2>{user.articles.length === 0 ? <p className="p-5 text-sm text-lp-gray">Aucune publication.</p> : <div className="divide-y">{user.articles.map((article) => <Link key={article.id} href={`/admin/articles/${article.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50"><span><strong>{article.title}</strong><small className="ml-2 text-lp-gray">{article.category.name}</small></span><span className="text-xs font-semibold">{STATUS_LABELS[article.status]}</span></Link>)}</div>}</section></div>;
}
