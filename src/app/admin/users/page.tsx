import prisma from "@/lib/prisma";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/constants";
import { STAFF_ROLES } from "@/lib/roles";
import { CreateStaffUserForm } from "@/components/admin/CreateStaffUserForm";
import { UserActions } from "@/components/admin/UserActions";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; scope?: string }> }) {
  const { q, scope } = await searchParams;
  const users = await prisma.user.findMany({
    where: {
      ...(scope === "staff" ? { role: { in: STAFF_ROLES } } : scope === "subscribers" ? { role: "ABONNE" } : {}),
      ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
  }).catch(() => []);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Utilisateurs et rédaction</h1>
      <p className="mb-8 text-sm text-lp-gray">
        Gérez les abonnés et les comptes de la rédaction. Les abonnés lecteurs se connectent via Google ou e-mail sur{" "}
        <Link href="/connexion" className="text-lp-accent hover:underline">/connexion</Link>.
      </p>

      <CreateStaffUserForm />

      <form className="mb-5 grid gap-2 sm:flex sm:flex-wrap" action="/admin/users">
        <input name="q" defaultValue={q} placeholder="Rechercher un nom ou e-mail" className="min-w-0 border px-3 py-2 text-sm sm:min-w-64" />
        <select name="scope" defaultValue={scope || ""} className="border px-3 py-2 text-sm"><option value="">Tous les comptes</option><option value="subscribers">Abonnés</option><option value="staff">Rédaction</option></select>
        <button className="border px-4 py-2 text-sm font-semibold hover:bg-gray-50">Filtrer</button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-[760px] text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-lp-gray">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Inscrit le</th>
              <th className="px-4 py-3">Publications</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium"><Link href={`/admin/users/${user.id}`} className="hover:text-lp-accent hover:underline">{user.name}</Link></td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-lp-anthracite px-2 py-0.5 text-xs font-semibold text-white">
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.isActive ? (
                    <span className="text-green-600">Actif</span>
                  ) : (
                    <span className="text-red-600">Inactif</span>
                  )}
                </td>
                <td className="px-4 py-3 text-lp-gray">
                  {user.createdAt.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3">{user._count.articles}</td>
                <td className="px-4 py-3"><UserActions id={user.id} isActive={user.isActive} name={user.name} email={user.email} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
