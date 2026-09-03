import { ArticleGallery } from "@/components/articles/ArticleGallery";
import type { PhotoInfoImage } from "@/lib/data/photo-infos";

type PhotoInfo = { id: string; title: string; content: string | null; photos: PhotoInfoImage[] };

export function PhotoInfoSection({ items }: { items: PhotoInfo[] }) {
  if (!items.length) return null;
  return <section className="border-y border-gray-200 bg-lp-light py-10 sm:py-14"><div className="lp-container"><div className="mb-2"><p className="text-xs font-bold uppercase tracking-[0.18em] text-lp-accent">Photos des infos</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">L&apos;actualité en images</h2></div>{items.map((item) => <article key={item.id} className="mt-8 border-t border-gray-200 pt-6 first:border-t-0 first:pt-2"><h3 className="text-xl font-bold sm:text-2xl">{item.title}</h3>{item.content && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-lp-gray sm:text-base">{item.content}</p>}<ArticleGallery images={item.photos} /></article>)}</div></section>;
}
