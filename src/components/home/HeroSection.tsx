import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { formatRelativeDate } from "@/lib/utils";
import { LIVE_BRAND } from "@/lib/constants";
import { Clock, ArrowRight } from "lucide-react";
import type { getHomepageHero } from "@/lib/data/articles";

type HeroData = Awaited<ReturnType<typeof getHomepageHero>>;

interface HeroSectionProps {
  hero: HeroData;
}

export function HeroSection({ hero }: HeroSectionProps) {
  const { main, secondary } = hero;

  if (!main) return null;

  return (
    <section className="lp-container py-6 sm:py-8" aria-label="À la une">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-lp-accent">
            Édition du jour
          </span>
          <span className="hidden h-4 w-px bg-gray-300 sm:block" />
          <time className="hidden text-xs text-lp-gray sm:block">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </time>
        </div>
        <Link href="/live" className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-lp-live transition-colors hover:text-lp-accent sm:text-xs">
          <span className="h-2 w-2 shrink-0 rounded-full bg-lp-live lp-live-pulse" />
          <span className="max-w-[40vw] truncate sm:max-w-none">{LIVE_BRAND}</span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lp-fade-in lg:col-span-2">
          <ArticleCard article={main} variant="featured" showExcerpt priority />
          {main.publishedAt && (
            <div className="mt-3 flex items-center gap-4 text-xs text-lp-gray">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeDate(main.publishedAt)}
              </span>
              {main.readTimeMinutes && (
                <span>{main.readTimeMinutes} min de lecture</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-gray-200 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-lp-gray">
            À la une aussi
          </p>
          {secondary.map((article, i) => (
            <div
              key={article.id}
              className={`min-w-0 lp-fade-in lp-stagger-${Math.min(i + 1, 4)}`}
            >
              <ArticleCard article={article} variant="horizontal" />
            </div>
          ))}
          <Link
            href="/"
            className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-lp-accent hover:gap-2 transition-all"
          >
            Toute l&apos;actualité
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
