"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PhotoInfoImage } from "@/lib/data/photo-infos";

type PhotoInfo = {
  id: string;
  title: string;
  content: string | null;
  photos: PhotoInfoImage[];
};

export function PhotoInfoSection({ items }: { items: PhotoInfo[] }) {
  const slides = items.flatMap((item) => item.photos.map((photo) => ({ item, photo })));
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[active] ?? slides[0];
  const visiblePhotos = Array.from(
    { length: Math.min(3, slides.length) },
    (_, offset) => slides[(active + offset) % slides.length]
  );

  return (
    <section className="border-y border-gray-200 bg-lp-light" aria-label="Photos des infos">
      <div className="lp-container py-3 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <p className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-lp-accent sm:block">En images</p>
          <div className="h-8 w-px shrink-0 bg-gray-300" />
          <div className="min-w-0 flex-1" aria-live="polite">
            <p className="truncate text-sm font-bold leading-tight text-lp-black">{slide.item.title}</p>
            {slide.item.content && <p className="mt-0.5 truncate text-xs text-lp-gray">{slide.item.content}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {visiblePhotos.map(({ item, photo }, index) => (
              <div key={`${item.id}-${photo.url}`} className={`relative overflow-hidden rounded-md bg-gray-200 shadow-sm transition-opacity ${index === 0 ? "h-10 w-14 sm:h-12 sm:w-16" : "hidden h-9 w-12 opacity-70 sm:block sm:h-10 sm:w-14"}`}>
                <Image src={photo.url} alt={photo.alt || `Photo : ${item.title}`} fill sizes="(max-width: 640px) 56px, 64px" className="object-cover" />
              </div>
            ))}
          </div>
          {slides.length > 1 && <div className="hidden shrink-0 gap-1 sm:flex" aria-label={`Photo ${active + 1} sur ${slides.length}`}>{slides.map(({ item, photo }, index) => <span key={`${item.id}-${photo.url}`} className={`h-1.5 rounded-full transition-all ${index === active ? "w-4 bg-lp-accent" : "w-1.5 bg-gray-300"}`} />)}</div>}
        </div>
      </div>
    </section>
  );
}
