"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import type { ArticleFormValues } from "@/lib/article-schema";
import { STATUS_LABELS } from "@/lib/constants";

export default function EditJournalistArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const [articleId, setArticleId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<ArticleFormValues> | null>(null);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(async ({ id }) => {
      setArticleId(id);
      const response = await fetch(`/api/journaliste/articles/${id}`);
      const data = await response.json();
      if (!response.ok) { setError(data.error || "Chargement impossible"); return; }
      const article = data.article;
      setStatus(article.status);
      setReason(article.rejectionReason);
      setInitialValues({
        title: article.title, slug: article.slug, subtitle: article.subtitle || "", excerpt: article.excerpt || "", content: article.content,
        categoryId: article.categoryId, status: article.scheduledAt && article.status !== "PUBLIE" ? "PROGRAMME" : article.status, contentType: article.contentType, featuredImage: article.featuredImage || "",
        featuredImageAlt: article.featuredImageAlt || "", geoZone: article.geoZone || "", scheduledAt: article.scheduledAt ? new Date(article.scheduledAt).toISOString().slice(0, 16) : "",
      });
    }).catch(() => setError("Chargement impossible"));
  }, [params]);

  if (error) return <div className="lp-container py-10"><p className="text-red-700">{error}</p><Link href="/journaliste" className="mt-4 inline-block text-lp-accent">Retour à mes publications</Link></div>;
  if (!articleId || !initialValues) return <div className="lp-container py-10 text-lp-gray">Chargement…</div>;

  return <div className="lp-container max-w-5xl py-10"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Modifier la publication</h1><p className="mt-2 text-sm text-lp-gray">Statut : {STATUS_LABELS[status] || status}</p></div><DeleteArticleButton articleId={articleId} endpoint="/api/journaliste/articles" redirectTo="/journaliste" label="Supprimer" /></div>{status === "REFUSE" && reason && <div className="my-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-900"><strong>Motif du refus :</strong> {reason}</div>}<div className="mt-8"><ArticleForm mode="edit" articleId={articleId} initialValues={initialValues} apiBase="/api/journaliste/articles" returnPath="/journaliste" /></div></div>;
}
