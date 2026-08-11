"use client";

import Link from "next/link";

type TickerItem = {
  id: string;
  title: string;
  href: string;
};

export function BreakingNewsTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  const tickerItems = [...items, ...items];

  return (
    <div
      className="border-b border-red-900/30 bg-gradient-to-r from-red-700 via-lp-breaking to-red-700 text-white"
      role="region"
      aria-label="Dernières informations"
    >
      <div className="lp-container flex items-stretch">
        <div className="flex shrink-0 items-center gap-2 bg-black/25 px-4 py-3 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-white lp-live-pulse" aria-hidden="true" />
          <span className="hidden sm:inline">Dernières infos</span>
          <span className="sm:hidden">Infos</span>
        </div>
        <div className="relative flex-1 overflow-hidden py-3">
          <div className="lp-breaking-ticker flex whitespace-nowrap">
            {tickerItems.map((item, i) => (
              <Link
                key={`${item.id}-${i}`}
                href={item.href}
                className="mx-6 inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-80 sm:mx-10"
              >
                <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Urgent
                </span>
                <span className="text-white/95">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
