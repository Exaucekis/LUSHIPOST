"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Trash2 } from "lucide-react";

interface DeleteArticleButtonProps {
  articleId: string;
  endpoint?: string;
  redirectTo: string;
  label?: string;
}

export function DeleteArticleButton({
  articleId,
  endpoint = "/api/admin/articles",
  redirectTo,
  label = "Supprimer",
}: DeleteArticleButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm("Supprimer cet article ?\n\nCette action est irréversible. L’article sera définitivement supprimé.");
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`${endpoint}/${articleId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de supprimer cet article.");
      setSuccess("Article supprimé avec succès.");
      router.push(redirectTo);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de supprimer cet article. Veuillez réessayer.");
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
        title={label}
      >
        {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        <span>{deleting ? "Suppression..." : label}</span>
      </button>
      {error && <span className="text-xs text-red-700" role="alert">{error}</span>}
      {success && <span className="text-xs text-green-700" role="status">{success}</span>}
    </span>
  );
}
