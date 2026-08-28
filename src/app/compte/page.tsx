import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { isJournalistRole, isStaffRole } from "@/lib/roles";
import { SITE_NAME } from "@/lib/constants";
import prisma from "@/lib/prisma";
import { Bell, LogOut } from "lucide-react";
import { AccountSettings } from "@/components/account/AccountSettings";
import { normalizePreferences } from "@/lib/account-preferences";

export default async function ComptePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/connexion?callbackUrl=/compte");
  }

  if (isJournalistRole(session.user.role)) {
    redirect("/journaliste");
  }

  if (isStaffRole(session.user.role)) {
    redirect("/admin");
  }

  const [subscriber, user] = await Promise.all([
    prisma.newsletterSubscriber.findUnique({ where: { email: session.user.email } }).catch(() => null),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        username: true,
        image: true,
        preferences: true,
        createdAt: true,
        accounts: { where: { provider: "google" }, select: { provider: true } },
      },
    }),
  ]);

  if (!user) redirect("/api/auth/signout?callbackUrl=/connexion");

  return (
    <div className="lp-container py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-3xl font-bold">Mon espace abonné</h1>
        <p className="mb-8 text-lp-gray">
          Bienvenue sur {SITE_NAME}. Votre compte reste connecté sur cet appareil.
        </p>

        <div className="space-y-4">
          <AccountSettings initialUser={{
            name: user.name,
            email: user.email,
            username: user.username,
            image: user.image,
            preferences: normalizePreferences(user.preferences),
            createdAt: user.createdAt,
            googleConnected: user.accounts.length > 0,
          }} />

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
