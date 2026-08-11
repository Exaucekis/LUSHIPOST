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
}

export function ArticleCard({
  article,
  variant = "default",
  showExcerpt = false,
  priority = false,
}: ArticleCardProps) {
  const href = `/article/${article.slug}`;
  const region = article.geoZone || article.africaRegion;

  if (variant === "horizontal") {
    return (
      <article className="lp-card group flex gap-4 border-b border-gray-100 pb-4">
        {article.featuredImage && (
          <Link href={href} className="relative block h-24 w-36 shrink-0 overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="144px"
            />
          </Link>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {article.category && (
            <Link href={`/${article.category.slug}`} className="lp-category-badge mb-1">
              {article.category.name}
            </Link>
          )}
          <Link href={href}>
            <h3 className="lp-article-title text-base md:text-lg">{article.title}</h3>
          </Link>
          {article.publishedAt && (
            <time className="mt-1 text-xs text-lp-gray">
              {formatRelativeDate(article.publishedAt)}
            </time>
          )}
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group border-b border-gray-100 py-3">
        <Link href={href} className="flex gap-3">
          <span className="text-2xl font-black text-lp-accent/30">
            {String(Math.floor(Math.random() * 5) + 1).padStart(2, "0")}
          </span>
          <div>
            <h3 className="text-sm font-bold leading-snug group-hover:text-lp-accent">
              {article.title}
            </h3>
            {article.publishedAt && (
              <time className="text-xs text-lp-gray">
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
      <article className="lp-card group relative">
        <Link href={href} className="block">
          {article.featuredImage && (
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.featuredImageAlt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={priority}
                sizes="(max-width: 768px) 100vw, 66vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {article.category && (
                  <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-red-400">
                    {article.category.name}
                  </span>
                )}
                <h2 className="lp-article-title-lg text-white group-hover:text-red-200">
                  {article.title}
                </h2>
                {showExcerpt && article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">{article.excerpt}</p>
                )}
              </div>
            </div>
          )}
        </Link>
      </article>
    );
  }

  return (
    <article className="lp-card group">
      <Link href={href}>
        {article.featuredImage && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            {article.isSponsored && (
              <span className="absolute left-2 top-2 bg-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase">
                Publicité
              </span>
            )}
          </div>
        )}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {article.category && (
              <span className="lp-category-badge">{article.category.name}</span>
            )}
            {region && (
              <span className="text-[10px] uppercase text-lp-gray">{region}</span>
            )}
          </div>
          <h3 className="lp-article-title text-lg">{article.title}</h3>
          {showExcerpt && article.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-lp-gray">{article.excerpt}</p>
          )}
          {article.publishedAt && (
            <time className="mt-2 block text-xs text-lp-gray">
              {formatRelativeDate(article.publishedAt)}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
}
