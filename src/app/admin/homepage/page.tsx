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
  const [slots, setSlots] = useState<Slot[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        setArticles(data.articles || []);
        const sel: Record<string, string> = {};
        (data.slots || []).forEach((s: Slot) => {
          sel[`${s.slot}-${s.order}`] = s.article.id;
        });
        setSelections(sel);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      for (const config of SLOT_CONFIG) {
        const key = `${config.slot}-${config.order}`;
        const articleId = selections[key];
        if (articleId) {
          await fetch("/api/admin/homepage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slot: config.slot,
              articleId,
              order: config.order,
            }),
          });
        }
      }
      setMessage("Une mise à jour avec succès !");
    } catch {
      setMessage("Erreur lors de la sauvegarde.");
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

      <div className="max-w-2xl space-y-6">
        {SLOT_CONFIG.map((config) => {
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="lp-btn-accent disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer la UNE"}
        </button>

        {message && (
          <p className={`text-sm ${message.includes("succès") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
