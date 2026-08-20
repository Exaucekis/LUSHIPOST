import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import prisma from "@/lib/prisma";
import { User, Mail, Bell, LogOut } from "lucide-react";

export default async function ComptePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/connexion?callbackUrl=/compte");
  }

  if (isStaffRole(session.user.role)) {
    redirect("/admin");
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email: session.user.email },
  }).catch(() => null);

  return (
    <div className="lp-container py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-3xl font-bold">Mon espace abonné</h1>
        <p className="mb-8 text-lp-gray">
          Bienvenue sur LUSHIPOST. Votre compte reste connecté sur cet appareil.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 border border-gray-200 bg-white p-5">
            <User className="mt-0.5 h-5 w-5 shrink-0 text-lp-accent" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Profil</p>
              <p className="mt-1 font-semibold">{session.user.name}</p>
              <p className="text-sm text-lp-gray">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 border border-gray-200 bg-white p-5">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-lp-accent" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Newsletter</p>
              <p className="mt-1 text-sm">
                {subscriber?.isConfirmed
                  ? "Vous recevez nos actualités par e-mail."
                  : "Inscription newsletter en cours de confirmation."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 border border-gray-200 bg-white p-5">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-lp-accent" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Connexion</p>
              <p className="mt-1 text-sm text-lp-gray">
                Authentification sans mot de passe via Google ou lien magique.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="lp-btn-primary px-6 py-2.5">
            Lire l&apos;actualité
          </Link>
          <Link
            href="/api/auth/signout?callbackUrl=/"
            className="flex items-center gap-2 border border-gray-300 px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Link>
        </div>
      </div>
    </div>
  );
}
