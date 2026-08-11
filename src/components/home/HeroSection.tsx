import Link from "next/link";
import Image from "next/image";
import { getHomepageHero } from "@/lib/data/articles";
import { ArticleCard } from "@/components/articles/ArticleCard";

export async function HeroSection() {
  const { main, secondary } = await getHomepageHero();

  if (!main) return null;

  return (
    <section className="lp-container py-6" aria-label="À la une">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ArticleCard article={main} variant="featured" showExcerpt priority />
        </div>
        <div className="flex flex-col gap-4">
          {secondary.map((article) => (
            <ArticleCard key={article.id} article={article} variant="horizontal" />
          ))}
        </div>
      </div>
    </section>
  );
}
