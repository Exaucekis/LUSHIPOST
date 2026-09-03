"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import { canPublish, hasPermission } from "@/lib/permissions";
import { STATUS_LABELS } from "@/lib/constants";
import type { ArticleFormValues } from "@/lib/article-schema";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const [articleId, setArticleId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<Partial<ArticleFormValues> | null>(null);
  const [meta, setMeta] = useState<{ viewCount: number; status: string; slug: string; rejectionReason?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setArticleId(id);
      fetch(`/api/admin/articles/${id}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Chargement impossible");
          const article = data.article;
          setInitialValues({
            title: article.title,
            slug: article.slug,
            subtitle: article.subtitle || "",
            excerpt: article.excerpt || "",
            content: article.content,
            categoryId: article.categoryId,
            status: article.status,
            contentType: article.contentType,
            featuredImage: article.featuredImage || "",
            featuredImageAlt: article.featuredImageAlt || "",
            geoZone: article.geoZone || "",
            scheduledAt: article.scheduledAt
              ? new Date(article.scheduledAt).toISOString().slice(0, 16)
              : "",
          });
          setMeta({
            viewCount: article.viewCount,
            status: article.status,
            slug: article.slug,
            rejectionReason: article.rejectionReason,
          });
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return <p className="text-lp-gray">Chargement de l&apos;article...</p>;
  }

  if (error || !articleId || !initialValues) {
    return (
      <div>
        <p className="text-red-600">{error || "Article introuvable"}</p>
        <Link href="/admin/articles" className="mt-4 inline-block text-lp-accent hover:underline">
          Retour aux articles
        </Link>
      </div>
    );
  }

  const userCanPublish = session?.user?.role ? canPublish(session.user.role) : false;
  const userCanDelete = session?.user?.role ? hasPermission(session.user.role, "articles:delete") : false;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Modifier l&apos;article</h1>
          <p className="mt-1 text-sm text-lp-gray">
            Statut : {STATUS_LABELS[meta?.status || ""] || meta?.status} · {meta?.viewCount ?? 0} vues
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {meta?.slug && (
            <Link
              href={`/article/${meta.slug}`}
              target="_blank"
              className="text-sm font-semibold text-lp-accent hover:underline"
            >
              Voir sur le site →
            </Link>
          )}
          {userCanDelete && (
            <DeleteArticleButton
              articleId={articleId}
              redirectTo="/admin/articles"
              label="Supprimer"
            />
          )}
        </div>
      </div>

      {meta?.status === "REFUSE" && meta.rejectionReason && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <strong>Motif du refus :</strong> {meta.rejectionReason}
        </div>
      )}

      <ArticleForm
        mode="edit"
        articleId={articleId}
        initialValues={initialValues}
        canPublish={userCanPublish}
      />
    </div>
  );
}
