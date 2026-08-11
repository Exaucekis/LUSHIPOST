import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { getLatestArticles, getPopularArticles, getVideos } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const [latest, popular, videos] = await Promise.all([
    getLatestArticles(6).catch(() => []),
    getPopularArticles(5).catch(() => []),
    getVideos(4).catch(() => []),
  ]);

  return (
    <>
      <HeroSection />

      <section className="border-t border-gray-200 bg-lp-light py-8">
        <div className="lp-container">
          <h2 className="lp-section-title mb-6">Actualités à la une</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((article) => (
              <ArticleCard key={article.id} article={article} showExcerpt />
            ))}
          </div>
        </div>
      </section>

      <CategorySection
        title="Lubumbashi"
        slug="lubumbashi"
        description="L'actualité locale de Lubumbashi : autorités, communes, entreprises, culture et vie quotidienne."
      />
      <CategorySection title="RDC" slug="rdc" />
      <CategorySection title="Haut-Katanga" slug="haut-katanga" />
      <CategorySection title="Politique" slug="politique" />
      <CategorySection title="Économie" slug="economie" />
      <CategorySection title="Société" slug="societe" />
      <CategorySection title="Sport" slug="sport" />
      <CategorySection title="Afrique" slug="afrique" />
      <CategorySection title="International" slug="international" />
      <CategorySection title="Tech" slug="tech" />

      {videos.length > 0 && (
        <section className="lp-container py-8" aria-labelledby="videos-section">
          <div className="mb-6 flex items-end justify-between">
            <h2 id="videos-section" className="lp-section-title">
              LUSHIPOST Vidéo
            </h2>
            <Link
              href="/video"
              className="text-xs font-bold uppercase tracking-wider text-lp-accent hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {videos.map((video) => (
              <Link key={video.id} href={`/video/${video.slug}`} className="lp-card group">
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail && (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lp-accent text-white">
                      ▶
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold leading-snug group-hover:text-lp-accent">
                    {video.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-gray-200 py-8">
        <div className="lp-container">
          <h2 className="lp-section-title mb-6">Les plus lus</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {popular.map((article, index) => (
              <article key={article.id} className="group flex gap-4 border-b border-gray-100 pb-4">
                <span className="text-4xl font-black text-lp-accent/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  {article.category && (
                    <span className="lp-category-badge">{article.category.name}</span>
                  )}
                  <Link href={`/article/${article.slug}`}>
                    <h3 className="mt-1 text-base font-bold group-hover:text-lp-accent">
                      {article.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-lp-gray">{article.viewCount.toLocaleString("fr-FR")} lectures</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <NewsletterForm />
    </>
  );
}
