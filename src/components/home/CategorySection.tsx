import Link from "next/link";
import { getPublishedArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";

interface CategorySectionProps {
  title: string;
  slug: string;
  limit?: number;
  description?: string;
}

export async function CategorySection({
  title,
  slug,
  limit = 4,
  description,
}: CategorySectionProps) {
  const articles = await getPublishedArticles({ categorySlug: slug, limit }).catch(() => []);

  if (articles.length === 0) return null;

  return (
    <section className="lp-container py-8" aria-labelledby={`section-${slug}`}>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 id={`section-${slug}`} className="lp-section-title">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-lp-gray">{description}</p>
          )}
        </div>
        <Link
          href={`/${slug}`}
          className="shrink-0 text-xs font-bold uppercase tracking-wider text-lp-accent hover:underline"
        >
          Voir tout →
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} showExcerpt />
        ))}
      </div>
    </section>
  );
}
