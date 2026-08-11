import Link from "next/link";
import { getBreakingNews } from "@/lib/data/articles";

export async function BreakingNewsBar() {
  const items = await getBreakingNews().catch(() => []);

  if (items.length === 0) return null;

  const tickerItems = [...items, ...items];

  return (
    <div
      className="border-b border-red-900/20 bg-lp-breaking text-white"
      role="region"
      aria-label="Dernières informations"
    >
      <div className="lp-container flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-red-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
          <span className="h-2 w-2 rounded-full bg-white lp-live-pulse" aria-hidden="true" />
          Dernières infos
        </div>
        <div className="relative flex-1 overflow-hidden py-2.5">
          <div className="lp-breaking-ticker flex whitespace-nowrap">
            {tickerItems.map((item, i) => (
              <Link
                key={`${item.id}-${i}`}
                href={
                  item.article
                    ? `/article/${item.article.slug}`
                    : item.url || "#"
                }
                className="mx-8 inline-flex items-center gap-2 text-sm hover:underline"
              >
                <span className="font-bold uppercase">Dernière minute</span>
                <span className="text-white/90">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
