"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/constants";

const STAFF_ROLE_OPTIONS = [
  "JOURNALISTE",
  "REDACTEUR_EN_CHEF",
  "EDITEUR",
  "MODERATEUR",
  "VIDEOASTE",
  "SUPER_ADMIN",
] as const;

export function CreateStaffUserForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "JOURNALISTE",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Erreur lors de la création.");
      setLoading(false);
      return;
    }

    setSuccess(`Compte créé pour ${data.email}. Communiquez le mot de passe au collaborateur.`);
    setForm({ name: "", email: "", role: "JOURNALISTE", password: "" });
    setOpen(false);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="lp-btn-primary px-6 py-2.5"
        >
          + Créer un compte rédaction
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <h2 className="mb-4 text-lg font-bold">Nouveau compte rédaction</h2>
          <p className="mb-4 text-sm text-lp-gray">
            L&apos;adresse e-mail et le mot de passe seront transmis au journaliste ou à l&apos;administrateur.
            Ils se connecteront via l&apos;onglet « Rédaction » sur la page de connexion.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                Nom complet
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 px-3 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                E-mail professionnel
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-300 px-3 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                Rôle
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 focus:border-lp-accent focus:outline-none"
              >
                {STAFF_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] || role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider">
                Mot de passe temporaire
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                className="w-full border border-gray-300 px-3 py-2 focus:border-lp-accent focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="lp-btn-primary px-6 py-2 disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le compte"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-gray-300 px-6 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {success && (
        <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">{success}</p>
      )}
    </div>
  );
}
