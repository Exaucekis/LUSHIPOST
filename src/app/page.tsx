import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccess } from "@/components/home/QuickAccess";
import { CategorySection } from "@/components/home/CategorySection";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { PopularSection } from "@/components/home/PopularSection";
import { VideoSection } from "@/components/home/VideoSection";
import { getLatestArticles, getPopularArticles, getVideos } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";

const CATEGORY_SECTIONS = [
  {
    title: "Lubumbashi",
    slug: "lubumbashi",
    description:
      "L'actualité locale : autorités, communes, entreprises, culture et vie quotidienne.",
  },
  { title: "RDC", slug: "rdc" },
  { title: "Haut-Katanga", slug: "haut-katanga" },
  { title: "Politique", slug: "politique" },
  { title: "Économie", slug: "economie" },
  { title: "Société", slug: "societe" },
  { title: "Enquête", slug: "enquete", description: "Investigations, reportages de fond et révélations." },
  { title: "Sport", slug: "sport" },
  { title: "Afrique", slug: "afrique" },
  { title: "International", slug: "international" },
  { title: "Tech", slug: "tech" },
];

export default async function HomePage() {
  const [latest, popular, videos] = await Promise.all([
    getLatestArticles(6).catch(() => []),
    getPopularArticles(6).catch(() => []),
    getVideos(4).catch(() => []),
  ]);

  return (
    <>
      <HeroSection />
      <QuickAccess />

      <section className="border-y border-gray-200 bg-lp-light py-10 sm:py-12">
        <div className="lp-container">
          <h2 className="lp-section-title mb-8">Actualités à la une</h2>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
              {latest.map((article, i) => (
                <div key={article.id} className={`lp-fade-in ${i > 0 ? `lp-stagger-${Math.min(i, 4)}` : ""}`}>
                  <ArticleCard article={article} showExcerpt />
                </div>
              ))}
            </div>
            <PopularSection articles={popular} />
          </div>
        </div>
      </section>

      {CATEGORY_SECTIONS.map((cat, i) => (
        <CategorySection
          key={cat.slug}
          title={cat.title}
          slug={cat.slug}
          description={cat.description}
          alternate={i % 2 === 1}
        />
      ))}

      <VideoSection videos={videos} />
      <NewsletterForm />
    </>
  );
}
