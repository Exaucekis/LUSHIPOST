import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getArticleBySlug,
  getRelatedArticles,
  getLatestArticles,
  getPopularArticles,
  incrementArticleViews,
} from "@/lib/data/articles";
import { ShareButtons } from "@/components/articles/ShareButtons";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { formatDate, formatTime, getSiteUrl } from "@/lib/utils";
import {
  SITE_NAME,
  FACT_CHECK_LABELS,
  FACT_CHECK_COLORS,
} from "@/lib/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) return { title: "Article" };

  const url = `${getSiteUrl()}/article/${article.slug}`;

  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      url,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.featuredImage
        ? [{ url: article.featuredImage, alt: article.featuredImageAlt || article.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);

  if (!article) notFound();

  await incrementArticleViews(article.id).catch(() => {});

  const tagSlugs = article.tags.map((t) => t.tag.slug);
  const [related, latest, popular] = await Promise.all([
    getRelatedArticles(article.id, article.categoryId, tagSlugs).catch(() => []),
    getLatestArticles(5).catch(() => []),
    getPopularArticles(5).catch(() => []),
  ]);

  const articleUrl = `${getSiteUrl()}/article/${article.slug}`;
  const keyPoints = article.keyPoints as string[] | null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: article.author?.name || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${getSiteUrl()}/logo/lushipost.svg` },
    },
    mainEntityOfPage: articleUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="lp-container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <header className="mb-6">
              <Link
                href={`/${article.category.slug}`}
                className="lp-category-badge mb-3 inline-block"
              >
                {article.category.name}
              </Link>

              {article.isSponsored && (
                <span className="ml-2 rounded bg-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                  Contenu sponsorisé
                </span>
              )}

              {article.isFactCheck && article.factCheckVerdict && (
                <span
                  className={`ml-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white ${
                    FACT_CHECK_COLORS[article.factCheckVerdict]
                  }`}
                >
                  {FACT_CHECK_LABELS[article.factCheckVerdict]}
                </span>
              )}

              <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
                {article.title}
              </h1>

              {article.subtitle && (
                <p className="mt-4 text-xl text-lp-gray leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4 text-sm text-lp-gray">
                <span className="font-semibold text-lp-black">
                  Par {article.author?.name || SITE_NAME}
                </span>
                {article.publishedAt && (
                  <>
                    <time dateTime={article.publishedAt.toISOString()}>
                      {formatDate(article.publishedAt)}
                    </time>
                    <time>{formatTime(article.publishedAt)}</time>
                  </>
                )}
                <span>{article.readTimeMinutes} min de lecture</span>
                {article.contentType !== "FAITS" && (
                  <span className="rounded bg-lp-light px-2 py-0.5 text-xs font-bold uppercase">
                    {article.contentType === "ANALYSE" ? "Analyse" : "Opinion"}
                  </span>
                )}
              </div>
            </header>

            {article.featuredImage && (
              <figure className="mb-8">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={article.featuredImage}
                    alt={article.featuredImageAlt || article.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>
                {article.featuredImageCaption && (
                  <figcaption className="mt-2 text-sm text-lp-gray italic">
                    {article.featuredImageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {keyPoints && keyPoints.length > 0 && (
              <aside className="mb-8 border-l-4 border-lp-accent bg-lp-light p-6">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider">
                  À retenir
                </h2>
                <ul className="space-y-2">
                  {keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="font-bold text-lp-accent">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            <div
              className="lp-prose"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.source && (
              <div className="mt-8 border-t border-gray-200 pt-4">
                <p className="text-sm text-lp-gray">
                  <span className="font-bold">Source :</span> {article.source.name}
                </p>
              </div>
            )}

            {article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map(({ tag }) => (
                  <Link
                    key={tag.id}
                    href={`/recherche?q=${encodeURIComponent(tag.name)}`}
                    className="rounded-full bg-lp-light px-3 py-1 text-xs font-medium hover:bg-lp-accent hover:text-white"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-gray-200 pt-6">
              <ShareButtons url={articleUrl} title={article.title} />
            </div>

            {related.length > 0 && (
              <section className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="lp-section-title mb-6">À lire aussi</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8">
            <div className="sticky top-24 space-y-8">
              <div>
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold uppercase tracking-wider">
                  Articles à lire
                </h2>
                {popular.slice(0, 4).map((a) => (
                  <ArticleCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
              <div>
                <h2 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold uppercase tracking-wider">
                  Dernières informations
                </h2>
                {latest.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>
    </>
  );
}
