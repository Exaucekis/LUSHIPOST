"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Library } from "lucide-react";
import type { ArticleFormValues } from "@/lib/article-schema";

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
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 lp-fade-in">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="lp-form-shell space-y-5">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Titre *</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className="lp-form-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Sous-titre</label>
          <input
            value={form.subtitle || ""}
            onChange={(e) => update("subtitle", e.target.value)}
            className="lp-form-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Chapô</label>
          <textarea
            value={form.excerpt || ""}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={2}
            className="lp-form-input"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Contenu *</label>
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            required
            rows={14}
            className="lp-form-input min-h-72 font-mono text-sm leading-relaxed"
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
            className="lp-form-input"
          >
            <option value="">Sélectionner...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase">Décision éditoriale</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="lp-form-input"
          >
            <option value="BROUILLON">Brouillon</option>
            <option value="EN_REVISION">Soumettre pour validation</option>
            {!canPublish && <option value="PROGRAMME">Programmer et soumettre pour validation</option>}
            {canPublish && <option value="PROGRAMME">Programmer la publication</option>}
            {canPublish && <option value="PUBLIE">Publier immédiatement</option>}
          </select>
          {!canPublish && (
            <p className="mt-1 text-xs text-lp-gray">
              Toute publication soumise est examinée par l&apos;administration avant diffusion.
            </p>
          )}
        </div>
        {form.status === "PROGRAMME" && (
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-bold uppercase">Date et heure de publication</label>
            <input
              type="datetime-local"
              value={form.scheduledAt || ""}
              onChange={(e) => update("scheduledAt", e.target.value)}
              required
              className="lp-form-input"
            />
            {!canPublish && <p className="mt-1 text-xs text-lp-gray">L&apos;article sera envoyé à l&apos;administrateur pour validation avant cette date.</p>}
          </div>
        )}
      </div>

      <div className="lp-form-shell space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider">Image principale</h2>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-lp-accent hover:bg-lp-accent-soft">
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
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-lp-accent hover:bg-lp-accent-soft"
          >
            <Library className="h-4 w-4" />
            Médiathèque
          </button>
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
          {loading ? "Enregistrement..." : form.status === "EN_REVISION" ? "Soumettre pour validation" : form.status === "PROGRAMME" ? "Programmer et soumettre" : mode === "create" ? "Enregistrer le brouillon" : "Enregistrer les modifications"}
        </button>
        <button type="button" onClick={() => router.back()} className="lp-btn-outline">
          Annuler
        </button>
      </div>
    </form>
  );
}
