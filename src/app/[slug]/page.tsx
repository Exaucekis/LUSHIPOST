import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getCategoryBySlug,
  getPublishedArticles,
  getPopularArticles,
  getLatestArticles,
} from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { CATEGORY_SLUGS } from "@/lib/constants";
import { SITE_NAME } from "@/lib/constants";

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
    <div className="lp-container py-8">
      <header className="mb-8 border-b-2 border-lp-black pb-6">
        <h1 className="text-4xl font-bold">{category.name}</h1>
        {CATEGORY_DESCRIPTIONS[slug] && (
          <p className="mt-3 max-w-3xl text-lp-gray">{CATEGORY_DESCRIPTIONS[slug]}</p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {featured && (
            <div className="mb-8">
              <ArticleCard article={featured} variant="featured" showExcerpt priority />
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} showExcerpt />
            ))}
          </div>

          {articles.length === 0 && (
            <p className="py-12 text-center text-lp-gray">
              Aucun article publié dans cette rubrique pour le moment.
            </p>
          )}
        </div>

        <aside className="space-y-8">
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">
              Les plus lus
            </h2>
            {popular.map((article, i) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider">
              Dernières informations
            </h2>
            {latest.map((article) => (
              <ArticleCard key={article.id} article={article} variant="horizontal" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
