"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ArticleCard } from "@/components/articles/ArticleCard";

type SearchResult = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  category?: { name: string; slug: string } | null;
  publishedAt?: string | null;
};

const FILTERS = [
  { id: "all", label: "Tout" },
  { id: "articles", label: "Articles" },
  { id: "videos", label: "Vidéos" },
] as const;

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const filterParam = searchParams.get("type") || "all";

  const [filter, setFilter] = useState(filterParam);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(query);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}&type=${filter}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query, filter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(input.trim())}&type=${filter}`;
    }
  };

  return (
    <div className="lp-container py-8">
      <h1 className="mb-6 text-3xl font-bold">Recherche</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Lubumbashi, RDC, mines, gouvernement..."
          className="flex-1 border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none"
        />
        <button type="submit" className="lp-btn-primary px-8">
          Rechercher
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === f.id
                ? "bg-lp-black text-white"
                : "bg-lp-light text-lp-black hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {query && (
        <p className="mb-6 text-lp-gray">
          Résultats pour : <strong className="text-lp-black">&laquo; {query} &raquo;</strong>
        </p>
      )}

      {loading && <p className="text-lp-gray">Recherche en cours...</p>}

      {!loading && query && results.length === 0 && (
        <p className="py-12 text-center text-lp-gray">
          Aucun résultat trouvé pour cette recherche.
        </p>
      )}

      <div className="grid gap-4">
        {results.map((article) => (
          <ArticleCard
            key={article.id}
            article={{
              ...article,
              publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
            }}
            variant="horizontal"
            showExcerpt
          />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="lp-container py-8">Chargement...</div>}>
      <SearchContent />
    </Suspense>
  );
}
