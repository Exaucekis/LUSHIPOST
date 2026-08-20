"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";

export function MediaUploadPanel() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    setError(null);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload échoué");
      setMessage(`Fichier uploadé (${data.storage === "s3" ? "cloud S3" : "local"}) : ${data.url}`);
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload échoué");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Uploader un média</p>
          <p className="text-xs text-lp-gray">
            S3 cloud si variables S3_* configurées, sinon stockage local (/uploads).
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold hover:bg-lp-light">
          <ImagePlus className="h-4 w-4" />
          {uploading ? "Upload..." : "Choisir un fichier"}
          <input
            type="file"
            accept="image/*,video/*,audio/*,.pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>
      </div>
      {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
