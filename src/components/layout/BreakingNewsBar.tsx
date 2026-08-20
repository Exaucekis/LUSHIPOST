import { BreakingNewsTicker } from "./BreakingNewsTicker";
import type { getBreakingNews } from "@/lib/data/articles";

type BreakingItem = Awaited<ReturnType<typeof getBreakingNews>>[number];

interface BreakingNewsBarProps {
  items: BreakingItem[];
}

export function BreakingNewsBar({ items }: BreakingNewsBarProps) {
  const tickerItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.article ? `/article/${item.article.slug}` : item.url || "#",
  }));

  return <BreakingNewsTicker items={tickerItems} />;
}
