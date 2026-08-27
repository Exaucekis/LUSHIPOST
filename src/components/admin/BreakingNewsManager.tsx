"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Pencil, Plus, Trash2 } from "lucide-react";

type BreakingItem = { id: string; title: string; url: string | null; isActive: boolean; order: number; expiresAt: string | null; articleTitle: string | null };
type FormValues = { title: string; url: string; order: string; expiresAt: string; isActive: boolean };
const emptyForm: FormValues = { title: "", url: "", order: "0", expiresAt: "", isActive: true };

export function BreakingNewsManager({ initialItems }: { initialItems: BreakingItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const payload = { ...form, order: Number(form.order), expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : "" };
    const response = await fetch(editingId ? `/api/admin/breaking/${editingId}` : "/api/admin/breaking", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json(); setSaving(false);
    if (!response.ok) { setError(data.error || "Enregistrement impossible"); return; }
    setForm(emptyForm); setEditingId(null); setMessage(editingId ? "Alerte mise à jour immédiatement." : "Alerte publiée dans la barre du site."); router.refresh();
  };

  const edit = (item: BreakingItem) => {
    setEditingId(item.id); setMessage(""); setError("");
    setForm({ title: item.title, url: item.url || "", order: String(item.order), expiresAt: item.expiresAt ? item.expiresAt.slice(0, 16) : "", isActive: item.isActive });
  };
  const update = async (id: string, payload: object) => {
    const response = await fetch(`/api/admin/breaking/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json(); if (!response.ok) { setError(data.error || "Modification impossible"); return; } router.refresh();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette alerte ?")) return;
    const response = await fetch(`/api/admin/breaking/${id}`, { method: "DELETE" });
    if (!response.ok) { setError("Suppression impossible"); return; } router.refresh();
  };

  return <div className="space-y-6">
    <form onSubmit={submit} className="lp-form-shell space-y-4">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-lp-breaking"><BellRing className="h-5 w-5" /></span><div><h2 className="font-bold">{editingId ? "Modifier l’alerte" : "Nouvelle dernière information"}</h2><p className="text-sm text-lp-gray">Visible instantanément sur la barre d’information du site.</p></div></div>
      <div className="grid gap-4 sm:grid-cols-[1fr_110px]"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex. Alerte trafic : avenue principale fermée" className="lp-form-input" /><input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="lp-form-input" aria-label="Ordre" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Lien facultatif (https://...)" className="lp-form-input" /><input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="lp-form-input" /></div>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Afficher immédiatement</label>
      {error && <p className="text-sm text-red-700">{error}</p>}{message && <p className="text-sm text-green-700">{message}</p>}
      <div className="flex gap-3"><button disabled={saving} className="lp-btn-accent">{saving ? "Enregistrement…" : editingId ? "Enregistrer les changements" : <><Plus className="h-4 w-4" /> Publier l’alerte</>}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-xl border px-4 py-2 text-sm font-semibold">Annuler</button>}</div>
    </form>
    <section className="lp-panel"><div className="lp-panel-heading"><h2 className="font-bold">Alertes en cours</h2><span className="text-sm text-lp-gray">{initialItems.length} élément(s)</span></div>{initialItems.length ? <div className="divide-y divide-gray-100">{initialItems.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-lp-gray">Ordre {item.order}{item.expiresAt ? ` · expire le ${new Date(item.expiresAt).toLocaleString("fr-FR")}` : " · sans expiration"}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => update(item.id, { isActive: !item.isActive })} className={`rounded-full px-3 py-1 text-xs font-bold ${item.isActive ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>{item.isActive ? "Visible" : "Masquée"}</button><button type="button" onClick={() => edit(item)} className="rounded-lg p-2 text-lp-accent hover:bg-lp-accent-soft" aria-label="Modifier"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => remove(item.id)} className="rounded-lg p-2 text-red-700 hover:bg-red-50" aria-label="Supprimer"><Trash2 className="h-4 w-4" /></button></div></div>)}</div> : <p className="p-10 text-center text-sm text-lp-gray">Aucune alerte active. Créez la première information urgente ci-dessus.</p>}</section>
  </div>;
}
