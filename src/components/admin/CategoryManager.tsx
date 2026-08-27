"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string; description: string | null; order: number; _count: { articles: number } };

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "", description: "", order: "0" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, order: Number(form.order) }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) { setError(data.error || "Création impossible"); return; }
    setForm({ name: "", slug: "", description: "", order: "0" }); router.refresh();
  };
  const remove = async (category: Category) => {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Suppression impossible"); return; }
    router.refresh();
  };
  const edit = async (category: Category) => {
    const name = window.prompt("Nom de la catégorie", category.name); if (!name) return;
    const order = window.prompt("Ordre d'affichage", String(category.order)); if (order === null) return;
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, order: Number(order) }) });
    const data = await response.json(); if (!response.ok) { setError(data.error || "Modification impossible"); return; } router.refresh();
  };
  return <div className="space-y-8"><form onSubmit={create} className="grid gap-3 rounded-lg border bg-white p-5 sm:grid-cols-2"><h2 className="sm:col-span-2 font-bold">Nouvelle catégorie</h2><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom" className="border px-3 py-2 text-sm"/><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug-en-minuscules" className="border px-3 py-2 text-sm"/><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (facultative)" className="border px-3 py-2 text-sm"/><input type="number" min="0" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} placeholder="Ordre" className="border px-3 py-2 text-sm"/>{error && <p className="sm:col-span-2 text-sm text-red-700">{error}</p>}<button disabled={loading} className="lp-btn-primary w-fit px-4 py-2 text-sm">{loading ? "Création…" : "Créer"}</button></form><div className="overflow-hidden rounded-lg border bg-white"><div className="border-b px-5 py-4 font-bold">Catégories existantes</div><div className="divide-y">{initialCategories.map((category) => <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="font-semibold">{category.name} <span className="text-sm font-normal text-lp-gray">/{category.slug}</span></p><p className="text-xs text-lp-gray">Ordre {category.order} · {category._count.articles} publication(s)</p></div><div className="flex gap-3"><button onClick={() => edit(category)} className="text-sm font-semibold text-lp-accent">Modifier</button><button onClick={() => remove(category)} disabled={category._count.articles > 0} title={category._count.articles > 0 ? "Déplacez d'abord les publications associées" : undefined} className="text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40">Supprimer</button></div></div>)}</div></div></div>;
}
