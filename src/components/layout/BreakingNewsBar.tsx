import { getBreakingNews } from "@/lib/data/articles";
import { BreakingNewsTicker } from "./BreakingNewsTicker";

export async function BreakingNewsBar() {
  const items = await getBreakingNews().catch(() => []);

  const tickerItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    href: item.article ? `/article/${item.article.slug}` : item.url || "#",
  }));

  return <BreakingNewsTicker items={tickerItems} />;
}
