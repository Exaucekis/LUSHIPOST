"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModerationPanel({ articleId, returnPath }: { articleId: string; returnPath?: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  const moderate = async (action: "approve" | "reject") => {
    if (action === "reject" && reason.trim().length < 5) {
      setError("Indiquez un motif de refus d'au moins 5 caractères.");
      return;
    }
    setLoading(action);
    setError("");
    const response = await fetch(`/api/admin/articles/${articleId}/moderation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "La modération a échoué.");
      setLoading(null);
      return;
    }
    if (returnPath) {
      router.push(`${returnPath}?notice=${encodeURIComponent(action === "approve" ? "Publication approuvée et publiée." : "Publication refusée.")}`);
      return;
    }
    router.refresh();
  };

  return (
    <section className="lp-panel mb-6 border-amber-200 bg-amber-50 p-5">
      <h2 className="font-bold text-amber-950">Validation éditoriale</h2>
      <p className="mt-1 text-sm text-amber-900">Cette publication est en attente. Son auteur sera notifié de votre décision.</p>
      <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-amber-950">Motif en cas de refus</label>
      <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="lp-form-input mt-1 border-amber-200 text-sm" placeholder="Expliquez clairement les corrections attendues…" />
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => moderate("approve")} disabled={loading !== null} className="rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 disabled:opacity-60">
          {loading === "approve" ? "Publication…" : "Approuver et publier"}
        </button>
        <button type="button" onClick={() => moderate("reject")} disabled={loading !== null} className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-800 disabled:opacity-60">
          {loading === "reject" ? "Refus…" : "Refuser avec motif"}
        </button>
      </div>
    </section>
  );
}
