"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type SocialLinkForm = {
  id?: string;
  platform: string;
  url: string;
  isActive: boolean;
  order: number;
};

const PLATFORMS = ["facebook", "instagram", "x", "linkedin", "tiktok", "youtube", "whatsapp"];

export function AdminSettingsForm() {
  const [tagline, setTagline] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Chargement impossible");
        setTagline(data.tagline || "");
        setSocialLinks(data.socialLinks || []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const updateLink = (index: number, field: keyof SocialLinkForm, value: string | boolean) => {
    setSocialLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const addLink = () => {
    setSocialLinks((prev) => [
      ...prev,
      { platform: "facebook", url: "", isActive: true, order: prev.length },
    ]);
  };

  const removeLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      tagline: tagline.trim(),
      socialLinks: socialLinks
        .filter((link) => link.url.trim())
        .map((link, index) => ({
          ...link,
          url: /^https?:\/\//i.test(link.url.trim()) ? link.url.trim() : `https://${link.url.trim()}`,
          order: index,
        })),
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Enregistrement impossible");
      setMessage("Paramètres enregistrés avec succès.");
      setSocialLinks(payload.socialLinks);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-lp-gray">Chargement...</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {message && (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>
      )}
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <section className="rounded-lg border bg-white p-6">
        <h2 className="mb-4 font-bold">Identité du site</h2>
        <label className="mb-1 block text-xs font-bold uppercase">Signature éditoriale</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          required
          className="w-full border px-4 py-2 focus:border-lp-accent focus:outline-none"
          placeholder="L'information au cœur de Lubumbashi."
        />
      </section>

      <section className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Réseaux sociaux</h2>
          <button type="button" onClick={addLink} className="inline-flex items-center gap-1 text-sm font-semibold text-lp-accent">
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={link.id || `new-${index}`} className="grid gap-3 rounded border p-4 sm:grid-cols-[140px_1fr_auto_auto] sm:items-center">
              <select
                value={link.platform}
                onChange={(e) => updateLink(index, "platform", e.target.value)}
                className="border px-3 py-2 text-sm focus:border-lp-accent focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                value={link.url}
                onChange={(e) => updateLink(index, "url", e.target.value)}
                placeholder="facebook.com/votre-page ou https://..."
                className="border px-3 py-2 text-sm focus:border-lp-accent focus:outline-none"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.isActive}
                  onChange={(e) => updateLink(index, "isActive", e.target.checked)}
                />
                Actif
              </label>
              <button type="button" onClick={() => removeLink(index)} className="text-red-600 hover:text-red-800" aria-label="Supprimer">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {socialLinks.length === 0 && (
            <p className="text-sm text-lp-gray">Aucun réseau social configuré.</p>
          )}
        </div>
      </section>

      <button type="submit" disabled={saving} className="lp-btn-accent disabled:opacity-50">
        {saving ? "Enregistrement..." : "Enregistrer les paramètres"}
      </button>
    </form>
  );
}
