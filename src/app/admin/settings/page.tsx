import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session.user.role, "settings:manage")) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">Paramètres</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-900">
          Vous n&apos;avez pas les droits nécessaires pour modifier les paramètres du site.
          Contactez un rédacteur en chef ou un administrateur.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Paramètres</h1>
      <p className="mb-8 text-sm text-lp-gray">
        Signature éditoriale du footer et liens vers vos réseaux sociaux.
      </p>
      <AdminSettingsForm />
    </div>
  );
}
