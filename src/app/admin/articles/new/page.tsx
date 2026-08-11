"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    excerpt: "",
    content: "",
    categoryId: "",
    status: "BROUILLON",
    contentType: "FAITS",
    featuredImage: "",
    geoZone: "",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/articles/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !prev.slug) {
        next.slug = value
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      return next;
    });
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Nouvel article</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Titre *</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Slug</label>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Chapô</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              rows={2}
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Contenu *</label>
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              required
              rows={12}
              className="w-full border px-4 py-2 font-mono text-sm focus:border-lp-accent focus:outline-none"
              placeholder="HTML autorisé : <p>, <h2>, <blockquote>..."
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Catégorie *</label>
            <select
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              required
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Statut</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            >
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_REVISION">En révision</option>
              <option value="PROGRAMME">Programmé</option>
              <option value="PUBLIE">Publié</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Type de contenu</label>
            <select
              value={form.contentType}
              onChange={(e) => update("contentType", e.target.value)}
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            >
              <option value="FAITS">Faits</option>
              <option value="ANALYSE">Analyse</option>
              <option value="OPINION">Opinion</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Zone géographique</label>
            <input
              value={form.geoZone}
              onChange={(e) => update("geoZone", e.target.value)}
              placeholder="Lubumbashi, Likasi..."
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase">Image principale (URL)</label>
            <input
              value={form.featuredImage}
              onChange={(e) => update("featuredImage", e.target.value)}
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="lp-btn-accent disabled:opacity-50">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="lp-btn-outline"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
