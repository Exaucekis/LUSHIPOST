"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Heart, Loader2, UserRound } from "lucide-react";
import { PREFERENCE_OPTIONS } from "@/lib/account-preferences";

type AccountUser = {
  name: string;
  email: string;
  username: string | null;
  image: string | null;
  createdAt: Date;
  preferences: string[];
  googleConnected: boolean;
};

export function AccountSettings({ initialUser }: { initialUser: AccountUser }) {
  const { update } = useSession();
  const [user, setUser] = useState(initialUser);
  const [name, setName] = useState(initialUser.name);
  const [username, setUsername] = useState(initialUser.username ?? "");
  const [preferences, setPreferences] = useState(initialUser.preferences);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const save = async (data: Record<string, unknown>, kind: "profile" | "preferences") => {
    setError("");
    setMessage("");
    if (kind === "profile") setSavingProfile(true);
    else setSavingPreferences(true);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Enregistrement impossible.");
      setUser(payload.user);
      setName(payload.user.name);
      setUsername(payload.user.username ?? "");
      setPreferences(payload.user.preferences);
      await update({ name: payload.user.name });
      setMessage(kind === "profile" ? "Profil enregistré." : "Préférences enregistrées.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Enregistrement impossible.");
    } finally {
      if (kind === "profile") setSavingProfile(false);
      else setSavingPreferences(false);
    }
  };

  const togglePreference = (value: string) => {
    setPreferences((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  return (
    <div className="space-y-5">
      <section className="border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lp-light text-lp-accent">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-lp-gray">Profil</p>
            <p className="mt-1 break-words font-semibold">{user.email}</p>
            <p className="mt-1 text-sm text-lp-gray">
              Compte créé le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(user.createdAt))}
            </p>
            {user.googleConnected && <p className="mt-2 text-sm text-green-700">Google est associé à ce compte.</p>}
          </div>
        </div>

        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save({ name, username: username.trim() || null }, "profile");
          }}
        >
          <label className="text-sm font-semibold">
            Nom affiché
            <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} className="mt-1.5 w-full border border-gray-300 px-3 py-2.5 font-normal focus:border-lp-accent focus:outline-none" />
          </label>
          <label className="text-sm font-semibold">
            Nom d&apos;utilisateur
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="ex. katanga_news" minLength={3} maxLength={30} pattern="[A-Za-z0-9][A-Za-z0-9_-]*" className="mt-1.5 w-full border border-gray-300 px-3 py-2.5 font-normal focus:border-lp-accent focus:outline-none" />
            <span className="mt-1 block text-xs font-normal text-lp-gray">Lettres, chiffres, tirets et underscores.</span>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" disabled={savingProfile} className="lp-btn-primary inline-flex items-center gap-2 px-5 py-2.5 disabled:opacity-60">
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer le profil
            </button>
          </div>
        </form>
      </section>

      <section className="border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Heart className="mt-0.5 h-5 w-5 text-lp-accent" />
          <div>
            <h2 className="font-bold">Mes informations favorites</h2>
            <p className="mt-1 text-sm text-lp-gray">Choisissez les sujets que vous souhaitez retrouver plus facilement.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((option) => {
            const selected = preferences.includes(option.value);
            return (
              <button key={option.value} type="button" onClick={() => togglePreference(option.value)} aria-pressed={selected} className={`inline-flex items-center gap-1.5 border px-3 py-2 text-sm font-semibold transition-colors ${selected ? "border-lp-accent bg-lp-accent text-white" : "border-gray-300 hover:border-lp-accent"}`}>
                {selected && <Check className="h-3.5 w-3.5" />}
                {option.label}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => void save({ preferences }, "preferences")} disabled={savingPreferences} className="lp-btn-primary mt-5 inline-flex items-center gap-2 px-5 py-2.5 disabled:opacity-60">
          {savingPreferences && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer mes préférences
        </button>
      </section>

      {message && <p className="text-sm text-green-700" role="status">{message}</p>}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
