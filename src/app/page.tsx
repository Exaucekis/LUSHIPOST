import { HeroSection } from "@/components/home/HeroSection";
import { QuickAccess } from "@/components/home/QuickAccess";
import { CategorySection } from "@/components/home/CategorySection";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { PopularSection } from "@/components/home/PopularSection";
import { VideoSection } from "@/components/home/VideoSection";
import { getHomepageData } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { HomePreferences } from "@/components/home/HomePreferences";
import { PhotoInfoSection } from "@/components/home/PhotoInfoSection";
import { getActivePhotoInfos } from "@/lib/data/photo-infos";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { normalizePreferences } from "@/lib/account-preferences";

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
  { title: "Santé", slug: "sante" },
  { title: "Enquête", slug: "enquete", description: "Investigations, reportages de fond et révélations." },
  { title: "Sport", slug: "sport" },
  { title: "Culture", slug: "culture" },
  { title: "Afrique", slug: "afrique" },
  { title: "International", slug: "international" },
  { title: "Tech", slug: "tech" },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const preferences = session?.user?.id
    ? normalizePreferences((await prisma.user.findUnique({ where: { id: session.user.id }, select: { preferences: true } }))?.preferences)
    : [];
  const personalizedSections = [
    ...CATEGORY_SECTIONS.filter((section) => preferences.includes(section.slug)),
    ...CATEGORY_SECTIONS.filter((section) => !preferences.includes(section.slug)),
  ];
  const categorySlugs = personalizedSections.map((cat) => cat.slug);
  const [{ hero, latest, popular, videos, categoryArticles }, photoInfos] = await Promise.all([
    getHomepageData(categorySlugs),
    getActivePhotoInfos(),
  ]);

  return (
    <>
      <HeroSection hero={hero} />
      <PhotoInfoSection items={photoInfos} />
      <QuickAccess />
      <HomePreferences />

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

      {personalizedSections.map((cat, i) => (
        <CategorySection
          key={cat.slug}
          title={cat.title}
          slug={cat.slug}
          description={cat.description}
          alternate={i % 2 === 1}
          articles={categoryArticles.get(cat.slug) ?? []}
        />
      ))}

      <VideoSection videos={videos} />
      <NewsletterForm />
    </>
  );
}
