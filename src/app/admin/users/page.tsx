import prisma from "@/lib/prisma";
import Link from "next/link";
import { ROLE_LABELS } from "@/lib/constants";
import { STAFF_ROLES } from "@/lib/roles";
import { CreateStaffUserForm } from "@/components/admin/CreateStaffUserForm";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { in: STAFF_ROLES } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  }).catch(() => []);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Utilisateurs rédaction</h1>
      <p className="mb-8 text-sm text-lp-gray">
        Créez les comptes journalistes et administrateurs. Les abonnés lecteurs
        se connectent séparément via Google ou e-mail sur{" "}
        <Link href="/connexion" className="text-lp-accent hover:underline">/connexion</Link>.
      </p>

      <CreateStaffUserForm />

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wider text-lp-gray">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium">{user.name}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
