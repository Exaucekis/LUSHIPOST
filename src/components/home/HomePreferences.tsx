"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Heart, Loader2 } from "lucide-react";
import { PREFERENCE_OPTIONS } from "@/lib/account-preferences";

export function HomePreferences() {
  const { status } = useSession();
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/preferences")
      .then(async (response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setPreferences(data.preferences ?? []))
      .catch(() => {});
  }, [status]);

  if (status !== "authenticated") return null;

  const toggle = async (value: string) => {
    const selected = preferences.includes(value);
    const next = selected ? preferences.filter((item) => item !== value) : [...preferences, value];
    setPreferences(next);
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/account/preferences", {
        method: selected ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      setPreferences(data.preferences ?? next);
      setMessage("Préférences enregistrées.");
    } catch {
      setPreferences(preferences);
      setMessage("Impossible d’enregistrer ce choix.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border-b border-gray-200 bg-lp-light py-5" aria-label="Personnaliser mon accueil">
      <div className="lp-container">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-lp-accent" />
            <p className="text-sm font-semibold">Personnalisez votre accueil</p>
          </div>
          {message && <p className="text-xs text-lp-gray" role="status">{message}</p>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PREFERENCE_OPTIONS.map((option) => {
            const selected = preferences.includes(option.value);
            return <button key={option.value} type="button" disabled={loading} onClick={() => void toggle(option.value)} aria-pressed={selected} className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60 ${selected ? "border-lp-accent bg-lp-accent text-white" : "border-gray-300 bg-white hover:border-lp-accent"}`}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : selected && <Check className="h-3.5 w-3.5" />}
              {option.label}
            </button>;
          })}
        </div>
      </div>
    </section>
  );
}
