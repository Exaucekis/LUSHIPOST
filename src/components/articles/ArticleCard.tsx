import Link from "next/link";
import Image from "next/image";
import { formatRelativeDate } from "@/lib/utils";

type ArticleCardData = {
  slug: string;
  title: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  publishedAt?: Date | null;
  category?: { name: string; slug: string } | null;
  geoZone?: string | null;
  africaRegion?: string | null;
  isSponsored?: boolean;
};

interface ArticleCardProps {
  article: ArticleCardData;
  variant?: "default" | "horizontal" | "compact" | "featured";
  showExcerpt?: boolean;
  priority?: boolean;
  rank?: number;
}

export function ArticleCard({
  article,
  variant = "default",
  showExcerpt = false,
  priority = false,
  rank,
}: ArticleCardProps) {
  const href = `/article/${article.slug}`;
  const region = article.geoZone || article.africaRegion;

  if (variant === "horizontal") {
    return (
      <article className="lp-card-flat group flex min-w-0 gap-3 py-4 sm:gap-4">
        {article.featuredImage && (
          <Link
            href={href}
            className="relative block h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-sm sm:h-24 sm:w-32"
          >
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="lp-image-zoom object-cover"
              sizes="128px"
            />
          </Link>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {article.category && (
            <Link href={`/${article.category.slug}`} className="lp-category-badge mb-1.5 w-fit">
              {article.category.name}
            </Link>
          )}
          <Link href={href}>
            <h3 className="lp-article-title text-base">{article.title}</h3>
          </Link>
          {article.publishedAt && (
            <time className="mt-1.5 text-xs text-lp-muted">
              {formatRelativeDate(article.publishedAt)}
            </time>
          )}
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    const displayRank = rank ?? 1;
    return (
      <article className="group border-b border-gray-100 py-3 last:border-0">
        <Link href={href} className="flex gap-3">
          <span className="lp-rank-number w-8 shrink-0 text-2xl">
            {String(displayRank).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-sm font-bold leading-snug transition-colors group-hover:text-lp-accent">
              {article.title}
            </h3>
            {article.publishedAt && (
              <time className="text-xs text-lp-muted">
                {formatRelativeDate(article.publishedAt)}
              </time>
            )}
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group overflow-hidden rounded-sm bg-lp-black shadow-lg">
        <Link href={href} className="block">
          {article.featuredImage && (
            <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[16/8]">
              <Image
                src={article.featuredImage}
                alt={article.featuredImageAlt || article.title}
                fill
                className="lp-image-zoom object-cover"
                priority={priority}
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 lp-hero-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                {article.category && (
                  <span className="mb-2 inline-block rounded-sm bg-lp-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                    {article.category.name}
                  </span>
                )}
                <h2 className="lp-article-title-lg line-clamp-2 text-balance text-white group-hover:text-red-200">
                  {article.title}
                </h2>
                {showExcerpt && article.excerpt && (
                  <p className="mt-2 line-clamp-1 max-w-2xl text-xs leading-relaxed text-white/85 sm:text-sm">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
          )}
        </Link>
      </article>
    );
  }

  return (
    <article className="lp-card group rounded-sm">
      <Link href={href} className="block">
        {article.featuredImage && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="lp-image-zoom object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {article.isSponsored && (
              <span className="absolute left-2 top-2 rounded-sm bg-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                Publicité
              </span>
            )}
            {article.category && (
              <span className="absolute bottom-2 left-2 lp-category-badge bg-white/95 backdrop-blur-sm">
                {article.category.name}
              </span>
            )}
          </div>
        )}
        <div className="p-4 sm:p-5">
          {!article.featuredImage && article.category && (
            <span className="lp-category-badge mb-2">{article.category.name}</span>
          )}
          <h3 className="lp-article-title">{article.title}</h3>
          {showExcerpt && article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-lp-gray">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-lp-muted">
            {region && <span className="truncate uppercase">{region}</span>}
            {region && article.publishedAt && <span>·</span>}
            {article.publishedAt && (
              <time>{formatRelativeDate(article.publishedAt)}</time>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
