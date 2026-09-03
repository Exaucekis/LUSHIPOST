"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type GalleryImage = { url: string; alt?: string; caption?: string };

export function ArticleGallery({ images }: { images: GalleryImage[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = [...track.querySelectorAll<HTMLElement>("[data-gallery-card]")];
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) setActive(Number((mostVisible.target as HTMLElement).dataset.galleryCard));
      },
      { root: track, threshold: [0.45, 0.7] }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [images.length]);

  const move = (direction: -1 | 1) => {
    const next = Math.max(0, Math.min(images.length - 1, active + direction));
    trackRef.current?.querySelector<HTMLElement>(`[data-gallery-card="${next}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(next);
  };

  if (!images.length) return null;

  return (
    <section className="my-10 overflow-hidden" aria-label="Photos de l'information">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lp-accent">En images</p>
          <h2 className="mt-1 text-xl font-bold">L&apos;info en photos</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => move(-1)} disabled={active === 0} className="rounded-full border p-2 disabled:opacity-30" aria-label="Photo précédente"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => move(1)} disabled={active === images.length - 1} className="rounded-full border p-2 disabled:opacity-30" aria-label="Photo suivante"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div ref={trackRef} className="scrollbar-hide -mx-4 flex snap-x snap-mandatory items-center gap-3 overflow-x-auto px-[14vw] py-5 sm:-mx-8 sm:gap-5 sm:px-[12vw]" aria-live="polite">
        {images.map((image, index) => (
          <figure key={image.url} data-gallery-card={index} className={`w-[72vw] shrink-0 snap-center transition-all duration-500 ease-out sm:w-[58vw] ${active === index ? "scale-100 opacity-100" : "scale-[0.82] opacity-60"}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-lp-light shadow-lg sm:aspect-[16/10]">
              <Image src={image.url} alt={image.alt || `Photo ${index + 1}`} fill sizes="(max-width: 640px) 72vw, 58vw" className="object-cover" />
            </div>
            {image.caption && <figcaption className="mt-2 px-1 text-sm text-lp-gray">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="mt-1 flex justify-center gap-1.5" aria-hidden="true">
        {images.map((image, index) => <span key={image.url} className={`h-1.5 rounded-full transition-all ${index === active ? "w-5 bg-lp-accent" : "w-1.5 bg-gray-300"}`} />)}
      </div>
    </section>
  );
}
