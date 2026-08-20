"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/constants";

type AccountUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminAccountPage() {
  const router = useRouter();
  const { update } = useSession();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/admin/account")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setProfileForm({
            name: data.user.name,
            email: data.user.email,
            currentPassword: "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    setProfileError(null);

    const payload: Record<string, string> = {};
    if (user && profileForm.name !== user.name) payload.name = profileForm.name;
    if (user && profileForm.email !== user.email) payload.email = profileForm.email;
    if (profileForm.currentPassword) payload.currentPassword = profileForm.currentPassword;

    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Erreur lors de la mise à jour");
        return;
      }

      setUser(data.user);
      setProfileForm((prev) => ({ ...prev, currentPassword: "" }));
      setProfileMessage("Profil mis à jour avec succès.");
      await update({
        name: data.user.name,
        email: data.user.email,
      });
      router.refresh();
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);
    setPasswordError(null);

    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Erreur lors du changement de mot de passe");
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("Mot de passe modifié avec succès.");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <p className="text-lp-gray">Chargement du compte…</p>;
  }

  if (!user) {
    return <p className="text-red-600">Impossible de charger votre compte.</p>;
  }

  const emailChanged = profileForm.email !== user.email;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Mon compte</h1>
        <p className="mt-1 text-lp-gray">
          Gérez votre profil, votre e-mail et votre mot de passe
        </p>
      </header>

      <div className="max-w-2xl space-y-8">
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 font-bold">Informations du compte</h2>
          <p className="mb-4 text-sm text-lp-gray">
            Rôle :{" "}
            <span className="font-semibold text-lp-anthracite">
              {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
            </span>
            {" · "}
            Membre depuis le{" "}
            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Nom complet
              </label>
              <input
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>

            {emailChanged && (
              <div>
                <label className="mb-1 block text-xs font-bold uppercase">
                  Mot de passe actuel *
                </label>
                <input
                  type="password"
                  value={profileForm.currentPassword}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  required
                  className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
                />
                <p className="mt-1 text-xs text-lp-gray">
                  Requis pour confirmer le changement d&apos;e-mail.
                </p>
              </div>
            )}

            {profileError && (
              <p className="text-sm text-red-600">{profileError}</p>
            )}
            {profileMessage && (
              <p className="text-sm text-green-600">{profileMessage}</p>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-lp-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-lp-accent/90 disabled:opacity-50"
            >
              {profileLoading ? "Enregistrement…" : "Enregistrer le profil"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-bold">Changer le mot de passe</h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
                className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
                className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                minLength={8}
                className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>

            {passwordError && (
              <p className="text-sm text-red-600">{passwordError}</p>
            )}
            {passwordMessage && (
              <p className="text-sm text-green-600">{passwordMessage}</p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="border border-lp-anthracite px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-lp-anthracite hover:text-white disabled:opacity-50"
            >
              {passwordLoading ? "Mise à jour…" : "Changer le mot de passe"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
