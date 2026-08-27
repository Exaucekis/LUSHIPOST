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
  return <div className="flex flex-wrap gap-2"><button type="button" disabled={loading} onClick={() => setEditing((open) => !open)} className="text-xs font-semibold text-lp-accent hover:underline">Modifier</button><button type="button" disabled={loading} onClick={() => request("PATCH")} className="text-xs font-semibold text-lp-accent hover:underline">{isActive ? "Désactiver" : "Réactiver"}</button><button type="button" disabled={loading} onClick={() => request("DELETE")} className="text-xs font-semibold text-red-700 hover:underline">Supprimer</button>{editing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"><div className="w-full max-w-md bg-white p-5 shadow-xl"><h2 className="font-bold">Modifier le compte</h2><input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Nom" className="mt-4 w-full border px-3 py-2 text-sm" /><input value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="E-mail" type="email" className="mt-2 w-full border px-3 py-2 text-sm" /><div className="mt-4 flex gap-3"><button type="button" disabled={loading} onClick={save} className="lp-btn-primary px-4 py-2 text-sm">Enregistrer</button><button type="button" onClick={() => setEditing(false)} className="border px-4 py-2 text-sm">Annuler</button></div></div></div>}</div>;
}
