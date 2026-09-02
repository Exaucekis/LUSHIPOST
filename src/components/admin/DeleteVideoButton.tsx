"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

interface DeleteVideoButtonProps {
  videoId: string;
  endpoint?: string;
  redirectTo?: string;
  label?: string;
  adminLabel?: string;
}

export function DeleteVideoButton({
  videoId,
  endpoint = "/api/admin/videos",
  redirectTo = "/admin/videos",
  label = "Supprimer",
  adminLabel,
}: DeleteVideoButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Supprimer ce reportage vidéo ?\n\nCette action est irréversible et le média sera définitivement retiré du site."
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${videoId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Impossible de supprimer ce reportage.");

      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de supprimer ce reportage.");
      setDeleting(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-1 text-red-700 hover:underline disabled:cursor-wait disabled:opacity-60"
        title={adminLabel ?? label}
      >
        {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        <span>{deleting ? "Suppression..." : (adminLabel ?? label)}</span>
      </button>
      {error && <span className="text-xs text-red-700" role="alert">{error}</span>}
    </span>
  );
}
