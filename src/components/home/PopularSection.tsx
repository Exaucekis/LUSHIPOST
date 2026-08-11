import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Flame } from "lucide-react";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  publishedAt?: Date | null;
  viewCount: number;
  category?: { name: string; slug: string } | null;
};

export function PopularSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <aside
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
      aria-labelledby="popular-title"
    >
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4">
        <Flame className="h-5 w-5 text-lp-accent" aria-hidden="true" />
        <h2 id="popular-title" className="text-sm font-bold uppercase tracking-wider">
          Les plus lus
        </h2>
      </div>
      <ol className="space-y-4">
        {articles.map((article, index) => (
          <li key={article.id}>
            <article className="group flex gap-3">
              <span className="lp-rank-number w-10 shrink-0 text-3xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 border-b border-gray-50 pb-4 last:border-0">
                {article.category && (
                  <Link
                    href={`/${article.category.slug}`}
                    className="lp-category-badge mb-1.5"
                  >
                    {article.category.name}
                  </Link>
                )}
                <Link href={`/article/${article.slug}`}>
                  <h3 className="text-sm font-bold leading-snug transition-colors group-hover:text-lp-accent">
                    {article.title}
                  </h3>
                </Link>
                <p className="mt-1 text-[11px] text-lp-muted">
                  {article.viewCount.toLocaleString("fr-FR")} lectures
                </p>
              </div>
            </article>
          </li>
        ))}
      </ol>
      <Link href="/recherche" className="lp-section-link mt-4 block text-center">
        Explorer
        <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
