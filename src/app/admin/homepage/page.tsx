"use client";

import { useState, useEffect } from "react";

type Slot = {
  id: string;
  slot: string;
  order: number;
  article: { id: string; title: string; slug: string; status: string };
};

type ArticleOption = { id: string; title: string; slug: string };

const SLOT_CONFIG = [
  { slot: "hero_main", label: "Article principal", order: 0 },
  { slot: "hero_secondary", label: "Article 2", order: 0 },
  { slot: "hero_secondary", label: "Article 3", order: 1 },
  { slot: "hero_secondary", label: "Article 4", order: 2 },
];

export default function HomepageManagementPage() {
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Chargement impossible");
        setArticles(data.articles || []);
        const sel: Record<string, string> = {};
        (data.slots || []).forEach((s: Slot) => {
          sel[`${s.slot}-${s.order}`] = s.article.id;
        });
        setSelections(sel);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      for (const config of SLOT_CONFIG) {
        const key = `${config.slot}-${config.order}`;
        const articleId = selections[key];
        if (articleId) {
          const res = await fetch("/api/admin/homepage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slot: config.slot,
              articleId,
              order: config.order,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Enregistrement impossible");
        }
      }
      setMessage("Mise à jour réussie.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Gestion de la UNE</h1>
      <p className="mb-8 text-lp-gray">
        Sélectionnez les articles affichés sur la page d&apos;accueil.
      </p>

      <div className="mx-auto max-w-2xl space-y-6">
        {loading && <p className="text-sm text-lp-gray">Chargement...</p>}
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
        {!loading &&
          SLOT_CONFIG.map((config) => {
          const key = `${config.slot}-${config.order}`;
          return (
            <div key={key} className="rounded-lg border border-gray-200 bg-white p-6">
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider">
                {config.label}
              </label>
              <select
                value={selections[key] || ""}
                onChange={(e) =>
                  setSelections((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
              >
                <option value="">— Aucun —</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {!loading && (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="lp-btn-accent disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer la UNE"}
            </button>

            {message && <p className="text-sm text-green-600">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
