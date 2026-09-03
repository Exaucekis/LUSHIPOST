"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, ImagePlus, Library, Trash2, X } from "lucide-react";
import type { ArticleFormValues } from "@/lib/article-schema";

type Category = { id: string; name: string; slug: string };

type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type GalleryImage = { url: string; alt?: string; caption?: string };

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
  gallery: [],
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
  canManageGallery?: boolean;
}

export function ArticleForm({
  mode,
  articleId,
  initialValues,
  canPublish = false,
  apiBase = "/api/admin/articles",
  returnPath = "/admin/articles",
  canManageGallery = false,
}: ArticleFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);
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

  const addGalleryImage = (image: GalleryImage) => {
    setForm((prev) => {
      const gallery = prev.gallery || [];
      if (gallery.length >= 4 || gallery.some((item) => item.url === image.url)) return prev;
      return { ...prev, gallery: [...gallery, image] };
    });
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({ ...prev, gallery: (prev.gallery || []).filter((_, itemIndex) => itemIndex !== index) }));
  };

  const updateGalleryImage = (index: number, field: "alt" | "caption", value: string) => {
    setForm((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).map((image, itemIndex) =>
        itemIndex === index ? { ...image, [field]: value } : image
      ),
    }));
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

  const handleGalleryUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload échoué");
      addGalleryImage({ url: data.url, alt: file.name.replace(/\.[^.]+$/, "") });
      loadMedia();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload échoué");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.status === "PUBLIE" && !hasPreviewed) {
      setError("Prévisualisez l’article avant de le publier.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug?.trim() || undefined,
      subtitle: form.subtitle?.trim() || undefined,
      excerpt: form.excerpt?.trim() || undefined,
      content: form.content.trim(),
      categoryId: form.categoryId.trim(),
      scheduledAt: form.scheduledAt?.trim() || undefined,
      featuredImage: form.featuredImage?.trim() || undefined,
      featuredImageAlt: form.featuredImageAlt?.trim() || undefined,
      ...(canManageGallery ? { gallery: (form.gallery || []).map((image) => ({
        url: image.url,
        alt: image.alt?.trim() || undefined,
        caption: image.caption?.trim() || undefined,
      })) } : {}),
      geoZone: form.geoZone?.trim() || undefined,
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

      const successMessage =
        payload.status === "PUBLIE"
          ? "Publication publiée avec succès."
          : payload.status === "EN_REVISION"
            ? "Publication envoyée pour validation."
            : payload.status === "PROGRAMME"
              ? "Publication programmée avec succès."
              : "Brouillon enregistré avec succès.";
      const adminList = returnPath === "/admin/articles";
      const statusFilter = payload.status === "PUBLIE"
        ? "PUBLIE"
        : payload.status === "PROGRAMME"
          ? "PROGRAMME"
          : payload.status === "EN_REVISION"
            ? "EN_REVISION"
            : "";
      const destination = adminList
        ? `/admin/articles${statusFilter ? `?status=${statusFilter}&` : "?"}notice=${encodeURIComponent(successMessage)}`
        : `${returnPath}?notice=${encodeURIComponent(successMessage)}`;

      setSuccess(successMessage);
      setError(null);
      router.push(destination);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
      setSuccess(null);
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
      {success && (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700" role="status">
          {success}
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
          <label className="mb-1 block text-xs font-bold uppercase">Introduction / résumé (chapô)</label>
          <textarea
            value={form.excerpt || ""}
            onChange={(e) => update("excerpt", e.target.value)}
            rows={2}
            className="lp-form-input"
          />
          <p className="mt-1 text-xs text-lp-gray">Le chapô est le court résumé affiché sous le titre : il donne envie de lire l’article.</p>
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
            {!canPublish && <option value="EN_REVISION">Soumettre pour validation</option>}
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
            <Image src={form.featuredImage} alt={form.featuredImageAlt || "Aperçu de l’image principale"} width={1600} height={900} className="max-h-48 w-full object-cover" />
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
                <Image src={item.url} alt={item.name} width={640} height={360} className="aspect-video w-full object-cover" />
                <span className="block truncate px-2 py-1 text-xs">{item.name}</span>
              </button>
            ))}
            {media.length === 0 && (
              <p className="text-sm text-lp-gray sm:col-span-3">Aucun média disponible.</p>
            )}
          </div>
        )}
      </div>

      {canManageGallery && <section className="lp-form-shell space-y-4" aria-labelledby="gallery-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="gallery-title" className="text-sm font-bold uppercase tracking-wider">Photos de l&apos;info</h2>
            <p className="mt-1 text-xs text-lp-gray">Ajoutez de 1 à 4 photos. Sur l&apos;article, elles se parcourent au doigt et la photo active s&apos;agrandit.</p>
          </div>
          <span className="rounded-full bg-lp-accent-soft px-2.5 py-1 text-xs font-bold text-lp-accent">{(form.gallery || []).length}/4</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-lp-accent hover:bg-lp-accent-soft">
            <ImagePlus className="h-4 w-4" />
            {uploading ? "Upload..." : "Ajouter une photo"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading || (form.gallery || []).length >= 4} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleGalleryUpload(file);
            }} />
          </label>
          <button type="button" onClick={() => { setShowGalleryPicker((value) => !value); loadMedia(); }} disabled={(form.gallery || []).length >= 4} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:border-lp-accent hover:bg-lp-accent-soft disabled:cursor-not-allowed disabled:opacity-50">
            <Library className="h-4 w-4" /> Médiathèque
          </button>
        </div>
        {showGalleryPicker && (
          <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-3">
            {media.filter((item) => item.type === "IMAGE").map((item) => (
              <button key={item.id} type="button" onClick={() => addGalleryImage({ url: item.url, alt: item.name })} disabled={(form.gallery || []).some((image) => image.url === item.url)} className="overflow-hidden rounded border text-left hover:ring-2 hover:ring-lp-accent disabled:opacity-40">
                <Image src={item.url} alt={item.name} width={640} height={360} className="aspect-video w-full object-cover" />
                <span className="block truncate px-2 py-1 text-xs">{item.name}</span>
              </button>
            ))}
          </div>
        )}
        {(form.gallery || []).length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {(form.gallery || []).map((image, index) => (
              <div key={image.url} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Image src={image.url} alt={image.alt || `Photo ${index + 1}`} width={960} height={540} className="aspect-video w-full object-cover" />
                <div className="space-y-2 p-3">
                  <input value={image.alt || ""} onChange={(e) => updateGalleryImage(index, "alt", e.target.value)} className="lp-form-input py-2 text-xs" placeholder="Description de l&apos;image" />
                  <input value={image.caption || ""} onChange={(e) => updateGalleryImage(index, "caption", e.target.value)} className="lp-form-input py-2 text-xs" placeholder="Légende (facultative)" />
                  <button type="button" onClick={() => removeGalleryImage(index)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"><Trash2 className="h-3.5 w-3.5" /> Retirer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" onClick={() => { setHasPreviewed(true); setShowPreview(true); }} className="lp-btn-outline sm:w-auto">
          <Eye className="h-4 w-4" /> Prévisualiser
        </button>
        <button type="submit" disabled={loading} className="lp-btn-accent disabled:opacity-50 sm:w-auto">
          {loading ? "Enregistrement..." : form.status === "PUBLIE" ? "Publier immédiatement" : form.status === "EN_REVISION" ? "Soumettre pour validation" : form.status === "PROGRAMME" ? "Programmer la publication" : mode === "create" ? "Enregistrer le brouillon" : "Enregistrer les modifications"}
        </button>
        <button type="button" onClick={() => router.back()} className="lp-btn-outline sm:w-auto">
          Annuler
        </button>
      </div>
      {form.status === "PUBLIE" && !hasPreviewed && <p className="text-xs font-medium text-amber-800">La prévisualisation est requise avant la publication immédiate.</p>}

      {showPreview && (
        <div className="fixed inset-0 z-[var(--lp-layer-modal)] overflow-y-auto bg-[#101828]/70 p-3 backdrop-blur-sm sm:p-4">
          <div className="mx-auto my-6 max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5"><div className="min-w-0"><p className="lp-dashboard-eyebrow mb-0">Aperçu avant publication</p><p className="truncate text-sm text-lp-gray">Rendu éditorial de votre article</p></div><button type="button" onClick={() => setShowPreview(false)} className="shrink-0 rounded-xl p-2 hover:bg-gray-100" aria-label="Fermer"><X className="h-5 w-5" /></button></div>
            <article className="mx-auto max-w-3xl break-words p-5 sm:p-10"><p className="lp-category-badge">{categories.find((category) => category.id === form.categoryId)?.name || "Catégorie"}</p><h1 className="mt-4 text-3xl font-bold sm:text-5xl">{form.title || "Titre de l’article"}</h1>{form.subtitle && <p className="mt-4 text-xl text-lp-gray">{form.subtitle}</p>}{form.excerpt && <p className="mt-6 border-l-4 border-lp-accent bg-lp-accent-soft px-5 py-4 text-lg font-medium text-lp-dark">{form.excerpt}</p>}{form.featuredImage && <><span className="sr-only">Image principale</span><Image src={form.featuredImage} alt={form.featuredImageAlt || "Aperçu de l’image principale"} width={1600} height={900} className="mt-7 aspect-video w-full rounded-2xl object-cover" /></>}{form.content && <div className="lp-prose mt-8" dangerouslySetInnerHTML={{ __html: form.content }} />}</article>
            <div className="flex border-t border-gray-100 p-4"><button type="button" onClick={() => setShowPreview(false)} className="lp-btn-accent w-full sm:ml-auto sm:w-auto">Revenir à l’édition</button></div>
          </div>
        </div>
      )}
    </form>
  );
}
