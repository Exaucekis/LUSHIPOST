"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserActions({ id, isActive, name, email }: { id: string; isActive: boolean; name: string; email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({ name, email });
  const request = async (method: "PATCH" | "DELETE") => {
    if (method === "DELETE" && !window.confirm(`Supprimer définitivement le compte de ${name} ?`)) return;
    setLoading(true);
    const response = await fetch(`/api/admin/users/${id}`, method === "PATCH" ? { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !isActive }) } : { method });
    setLoading(false);
    if (response.ok) router.refresh();
  };
  const save = async () => {
    if (values.name.trim().length < 2) return;
    setLoading(true);
    const response = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: values.name, email: values.email }) });
    setLoading(false);
    if (response.ok) { setEditing(false); router.refresh(); }
  };
  return <div className="flex flex-wrap gap-2"><button type="button" disabled={loading} onClick={() => setEditing((open) => !open)} className="rounded-lg px-2 py-1 text-xs font-semibold text-lp-accent hover:bg-lp-accent-soft">Modifier</button><button type="button" disabled={loading} onClick={() => request("PATCH")} className="rounded-lg px-2 py-1 text-xs font-semibold text-lp-accent hover:bg-lp-accent-soft">{isActive ? "Désactiver" : "Réactiver"}</button><button type="button" disabled={loading} onClick={() => request("DELETE")} className="rounded-lg px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Supprimer</button>{editing && <div className="fixed inset-0 z-[var(--lp-layer-modal)] grid overflow-y-auto bg-[#101828]/55 p-3 backdrop-blur-sm sm:p-4"><div role="dialog" aria-modal="true" aria-label="Modifier le compte" className="my-auto w-full max-w-md rounded-2xl border border-white/70 bg-white p-5 shadow-2xl sm:p-6"><h2 className="font-bold">Modifier le compte</h2><p className="mt-1 text-sm text-lp-gray">Les changements sont appliqués immédiatement.</p><input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Nom" className="lp-form-input mt-5 text-sm" /><input value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="E-mail" type="email" className="lp-form-input mt-3 text-sm" /><div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={loading} onClick={save} className="lp-btn-accent px-4 py-2 text-sm">{loading ? "Enregistrement…" : "Enregistrer"}</button><button type="button" onClick={() => setEditing(false)} className="min-h-11 rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50">Annuler</button></div></div></div>}</div>;
}
