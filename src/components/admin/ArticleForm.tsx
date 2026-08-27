"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Library } from "lucide-react";
import type { ArticleFormValues } from "@/lib/article-schema";
import { slugifyTitle } from "@/lib/article-schema";

type Category = { id: string; name: string; slug: string };

type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: string;
};

const EMPTY_FORM: ArticleFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  excerpt: "",
  content: "",
  categoryId: "",
  status: "BROUILLON",
  contentType: "FAITS",
  featuredImage: "",
  featuredImageAlt: "",
  geoZone: "",
  scheduledAt: "",
};

interface ArticleFormProps {
  mode: "create" | "edit";
  articleId?: string;
  initialValues?: Partial<ArticleFormValues>;
  canPublish?: boolean;
  apiBase?: string;
  returnPath?: string;
}

export function ArticleForm({
  mode,
  articleId,
  initialValues,
  canPublish = false,
  apiBase = "/api/admin/articles",
  returnPath = "/admin/articles",
}: ArticleFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [form, setForm] = useState<ArticleFormValues>({
    ...EMPTY_FORM,
    ...initialValues,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const loadMedia = () => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => setMedia(data.media || []))
      .catch(() => {});
  };

  useEffect(() => {
    if (showMediaPicker) loadMedia();
  }, [showMediaPicker]);

  const update = (field: keyof ArticleFormValues, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && mode === "create" && !prev.slug) {
        next.slug = slugifyTitle(value);
      }
      return next;
    });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload échoué");
      update("featuredImage", data.url);
      if (!form.featuredImageAlt) update("featuredImageAlt", file.name.replace(/\.[^.]+$/, ""));
      loadMedia();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload échoué");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      scheduledAt: form.scheduledAt || undefined,
      subtitle: form.subtitle || undefined,
      excerpt: form.excerpt || undefined,
      featuredImage: form.featuredImage || undefined,
      featuredImageAlt: form.featuredImageAlt || undefined,
      geoZone: form.geoZone || undefined,
    };

    if (!canPublish && payload.status === "PUBLIE") {
      payload.status = "EN_REVISION";
    }

    try {
      const url =
        mode === "create" ? apiBase : `${apiBase}/${articleId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'enregistrement");

      router.push(`${returnPath}/${data.id || articleId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
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
          <label className="mb-1 block text-xs font-bold uppercase">Slug *</label>
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            required
            className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Sous-titre</label>
          <input
            value={form.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
            className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Chapô</label>
          <textarea
            value={form.excerpt || ""}
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
            rows={14}
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
            <option value="EN_REVISION">Soumettre pour validation</option>
            <option value="PROGRAMME">Programmé</option>
            {canPublish && <option value="PUBLIE">Publié</option>}
            <option value="ARCHIVE">Archivé</option>
          </select>
          {!canPublish && (
            <p className="mt-1 text-xs text-lp-gray">
              La publication directe nécessite un rôle éditorial supérieur.
            </p>
          )}
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
            value={form.geoZone || ""}
            onChange={(e) => update("geoZone", e.target.value)}
            placeholder="Lubumbashi, Likasi..."
            className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
          />
        </div>
        {form.status === "PROGRAMME" && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase">Date de publication programmée</label>
            <input
              type="datetime-local"
              value={form.scheduledAt || ""}
              onChange={(e) => update("scheduledAt", e.target.value)}
              className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider">Image principale</h2>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold hover:bg-lp-light">
            <ImagePlus className="h-4 w-4" />
            {uploading ? "Upload..." : "Uploader"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowMediaPicker((v) => !v)}
            className="inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold hover:bg-lp-light"
          >
            <Library className="h-4 w-4" />
            Médiathèque
          </button>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">URL de l&apos;image</label>
          <input
            value={form.featuredImage || ""}
            onChange={(e) => update("featuredImage", e.target.value)}
            className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Texte alternatif</label>
          <input
            value={form.featuredImageAlt || ""}
            onChange={(e) => update("featuredImageAlt", e.target.value)}
            className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
          />
        </div>
        {form.featuredImage && (
          <div className="overflow-hidden rounded border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.featuredImage} alt={form.featuredImageAlt || ""} className="max-h-48 w-full object-cover" />
          </div>
        )}
        {showMediaPicker && (
          <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-3">
            {media.filter((m) => m.type === "IMAGE").map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  update("featuredImage", item.url);
                  if (!form.featuredImageAlt) update("featuredImageAlt", item.name);
                  setShowMediaPicker(false);
                }}
                className="overflow-hidden rounded border text-left hover:ring-2 hover:ring-lp-accent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.name} className="aspect-video w-full object-cover" />
                <span className="block truncate px-2 py-1 text-xs">{item.name}</span>
              </button>
            ))}
            {media.length === 0 && (
              <p className="text-sm text-lp-gray sm:col-span-3">Aucun média disponible.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="lp-btn-accent disabled:opacity-50">
          {loading ? "Enregistrement..." : mode === "create" ? "Créer l'article" : "Enregistrer les modifications"}
        </button>
        <button type="button" onClick={() => router.back()} className="lp-btn-outline">
          Annuler
        </button>
      </div>
    </form>
  );
}
