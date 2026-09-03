"use client";

import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Article = { id: string; title: string; status: string; gallery?: unknown };

export default function ArticlePhotosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((response) => response.json())
      .then((data) => setArticles(data.articles || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Photos des infos</h1>
      <p className="mb-8 text-lp-gray">Choisissez une info pour ajouter jusqu&apos;à quatre photos. Elles seront affichées dans un carrousel tactile sur l&apos;article.</p>
      {loading ? <p className="text-sm text-lp-gray">Chargement...</p> : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {articles.map((article) => {
            const count = Array.isArray(article.gallery) ? article.gallery.length : 0;
            return <Link key={article.id} href={`/admin/articles/${article.id}`} className="flex items-center justify-between gap-4 border-b border-gray-100 p-4 last:border-b-0 hover:bg-lp-accent-soft">
              <span className="min-w-0 truncate font-semibold">{article.title}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-lp-accent"><ImageIcon className="h-4 w-4" /> {count}/4 photos</span>
            </Link>;
          })}
          {articles.length === 0 && <p className="p-5 text-sm text-lp-gray">Aucune info disponible.</p>}
        </div>
      )}
    </div>
  );
}
