"use client";

import Image from "next/image";
import { ImagePlus, Link as LinkIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

type Photo = { url: string; alt?: string };
type Item = { id: string; title: string; content?: string | null; photos: Photo[]; isActive: boolean };
const empty = { title: "", content: "", photos: [] as Photo[], isActive: true };

export function PhotoInfoManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState(empty);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () => fetch("/api/admin/photo-infos").then((r) => r.json()).then((data) => setItems(data.items || []));
  useEffect(() => { load().catch(() => setError("Chargement impossible.")); }, []);
  const addPhoto = (url: string, alt = "") => {
    if (!url || form.photos.length >= 4 || form.photos.some((photo) => photo.url === url)) return;
    setForm((current) => ({ ...current, photos: [...current.photos, { url, alt }] }));
    setLink("");
  };
  const upload = async (file: File) => {
    setLoading(true); setError("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Téléversement impossible");
      addPhoto(data.url, file.name.replace(/\.[^.]+$/, ""));
    } catch (err) { setError(err instanceof Error ? err.message : "Téléversement impossible"); }
    finally { setLoading(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/photo-infos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Enregistrement impossible");
      setForm(empty); setMessage("Info photos publiée."); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Enregistrement impossible"); }
    finally { setLoading(false); }
  };
  const remove = async (id: string) => {
    if (!confirm("Supprimer cette info photos ?")) return;
    await fetch(`/api/admin/photo-infos/${id}`, { method: "DELETE" }); await load();
  };

  return <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <form onSubmit={save} className="lp-form-shell space-y-5">
      <div><label className="mb-1 block text-xs font-bold uppercase">Courte information *</label><input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="lp-form-input" placeholder="Ex. Marché central : une nouvelle voie ouverte" /></div>
      <div><label className="mb-1 block text-xs font-bold uppercase">Texte court</label><textarea maxLength={500} rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="lp-form-input" placeholder="Quelques lignes pour accompagner les images." /></div>
      <div className="flex items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold hover:border-lp-accent"><ImagePlus className="h-4 w-4" /> Téléverser<input type="file" accept="image/*" className="hidden" disabled={loading || form.photos.length >= 4} onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); }} /></label><span className="text-xs font-bold text-lp-accent">{form.photos.length}/4 photos</span></div>
      <div className="flex gap-2"><input type="url" value={link} onChange={(e) => setLink(e.target.value)} className="lp-form-input py-2" placeholder="https://... lien direct de l'image" /><button type="button" onClick={() => addPhoto(link)} className="shrink-0 rounded-xl border px-3 hover:border-lp-accent" aria-label="Ajouter le lien"><LinkIcon className="h-4 w-4" /></button></div>
      {form.photos.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{form.photos.map((photo, index) => <div key={photo.url} className="overflow-hidden rounded-xl border"><Image src={photo.url} alt={photo.alt || "Photo"} width={640} height={360} className="aspect-video w-full object-cover" /><div className="flex gap-2 p-2"><input value={photo.alt || ""} onChange={(e) => setForm((current) => ({ ...current, photos: current.photos.map((item, position) => position === index ? { ...item, alt: e.target.value } : item) }))} className="min-w-0 flex-1 rounded border px-2 py-1 text-xs" placeholder="Description" /><button type="button" onClick={() => setForm((current) => ({ ...current, photos: current.photos.filter((_, position) => position !== index) }))} className="text-red-600"><Trash2 className="h-4 w-4" /></button></div></div>)}</div>}
      {error && <p className="text-sm text-red-600">{error}</p>}{message && <p className="text-sm text-green-600">{message}</p>}
      <button disabled={loading} className="lp-btn-accent disabled:opacity-50">{loading ? "Enregistrement..." : "Publier l'info photos"}</button>
    </form>
    <aside><h2 className="mb-3 text-sm font-bold uppercase tracking-wider">Infos publiées</h2><div className="space-y-3">{items.map((item) => <div key={item.id} className="rounded-xl border bg-white p-3"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-lp-gray">{item.photos.length} photo(s)</p><button onClick={() => remove(item.id)} className="mt-2 text-xs font-semibold text-red-600 hover:underline">Supprimer</button></div>)}{items.length === 0 && <p className="text-sm text-lp-gray">Aucune info photos.</p>}</div></aside>
  </div>;
}
