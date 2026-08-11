import Link from "next/link";
import { getPublishedArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";

interface CategorySectionProps {
  title: string;
  slug: string;
  limit?: number;
  description?: string;
  alternate?: boolean;
}

export async function CategorySection({
  title,
  slug,
  limit = 4,
  description,
  alternate = false,
}: CategorySectionProps) {
  const articles = await getPublishedArticles({ categorySlug: slug, limit }).catch(() => []);

  if (articles.length === 0) return null;

  return (
    <section
      className={`py-10 sm:py-12 ${alternate ? "bg-lp-light" : "bg-white"}`}
      aria-labelledby={`section-${slug}`}
    >
      <div className="lp-container lp-fade-in">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id={`section-${slug}`} className="lp-section-title">
              {title}
            </h2>
            {description && (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-lp-gray">
                {description}
              </p>
            )}
          </div>
          <Link href={`/${slug}`} className="lp-section-link shrink-0">
            Voir tout
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article, i) => (
            <div
              key={article.id}
              className={`lp-fade-in ${i === 1 ? "lp-stagger-1" : i === 2 ? "lp-stagger-2" : i === 3 ? "lp-stagger-3" : ""}`}
            >
              <ArticleCard article={article} showExcerpt />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
