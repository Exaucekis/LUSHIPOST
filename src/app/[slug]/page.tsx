import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getCategoryBySlug,
  getPublishedArticles,
  getPopularArticles,
  getLatestArticles,
} from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { PopularSection } from "@/components/home/PopularSection";
import { CATEGORY_SLUGS, SITE_NAME } from "@/lib/constants";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  lubumbashi:
    "Actualité locale de Lubumbashi : autorités, communes, entreprises, universités, événements, culture, sport, sécurité et économie locale.",
  "haut-katanga":
    "Toute l'actualité du Haut-Katanga : Lubumbashi, Likasi, Kipushi, Kasumbalesa et les territoires de la province.",
  rdc: "Politique, économie, sécurité, société, justice, santé, éducation et institutions en République démocratique du Congo.",
  afrique:
    "L'actualité africaine : Afrique centrale, de l'Est, de l'Ouest, australe et du Nord.",
  international:
    "Europe, Amériques, Moyen-Orient, Asie, géopolitique, diplomatie et économie internationale.",
  verification:
    "Vérification des faits : rumeurs, fausses informations, images trompeuses et contenus viraux.",
  enquete:
    "Enquêtes et investigations : reportages de fond, révélations, corruption, mines, gouvernance et affaires d'intérêt public.",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return { title: "Rubrique" };

  return {
    title: category.name,
    description:
      CATEGORY_DESCRIPTIONS[slug] ||
      `Actualités ${category.name} — ${SITE_NAME}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);

  if (!category) notFound();

  const [articles, popular, latest] = await Promise.all([
    getPublishedArticles({ categorySlug: slug, limit: 20 }).catch(() => []),
    getPopularArticles(5).catch(() => []),
    getLatestArticles(6).catch(() => []),
  ]);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="pb-12">
      <div className="border-b border-gray-200 bg-lp-light">
        <div className="lp-container py-10 sm:py-12">
          <nav className="mb-4 text-xs font-semibold uppercase tracking-wider text-lp-muted">
            <Link href="/" className="hover:text-lp-accent">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-lp-black">{category.name}</span>
          </nav>
          <h1 className="text-4xl font-bold sm:text-5xl">{category.name}</h1>
          {CATEGORY_DESCRIPTIONS[slug] && (
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-lp-gray">
              {CATEGORY_DESCRIPTIONS[slug]}
            </p>
          )}
        </div>
      </div>

      <div className="lp-container py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {featured && (
              <div className="mb-10">
                <ArticleCard article={featured} variant="featured" showExcerpt priority />
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {rest.map((article) => (
                <ArticleCard key={article.id} article={article} showExcerpt />
              ))}
            </div>

            {articles.length === 0 && (
              <p className="py-16 text-center text-lp-gray">
                Aucun article publié dans cette rubrique pour le moment.
              </p>
            )}
          </div>

          <aside className="space-y-8">
            <PopularSection articles={popular} />
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-bold uppercase tracking-wider">
                Dernières infos
              </h2>
              {latest.map((article) => (
                <ArticleCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
