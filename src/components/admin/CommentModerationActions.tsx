"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentModerationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const update = async (nextStatus: "APPROUVE" | "SIGNALE" | "SUPPRIME") => { setLoading(true); setError(""); try { const response = await fetch(`/api/admin/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Modification impossible."); router.refresh(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Modification impossible."); } finally { setLoading(false); } };
  return <div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" disabled={loading || status === "APPROUVE"} onClick={() => void update("APPROUVE")} className="text-xs font-semibold text-green-700 disabled:opacity-40">Approuver</button><button type="button" disabled={loading || status === "SIGNALE"} onClick={() => void update("SIGNALE")} className="text-xs font-semibold text-amber-700 disabled:opacity-40">Signaler</button><button type="button" disabled={loading || status === "SUPPRIME"} onClick={() => void update("SUPPRIME")} className="text-xs font-semibold text-red-700 disabled:opacity-40">Supprimer</button>{error && <span className="text-xs text-red-700">{error}</span>}</div>;
}
