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
  const visiblePhotos = Array.from(
    { length: Math.min(3, slides.length) },
    (_, offset) => slides[(active + offset) % slides.length]
  );
  const tickerSlides = [...slides, ...slides];

  return (
    <section className="overflow-hidden border-y border-gray-200 bg-lp-light" aria-label="Photos des infos">
      <div className="lp-container flex min-w-0 items-center gap-3 py-3 sm:gap-4 sm:py-4">
        <div className="flex shrink-0 items-center gap-2">
            {visiblePhotos.map(({ item, photo }, index) => (
              <div key={`${item.id}-${photo.url}`} className={`relative overflow-hidden rounded-lg bg-gray-200 shadow-md ring-1 ring-black/10 transition-opacity ${index === 0 ? "h-24 w-36 sm:h-28 sm:w-44" : "hidden h-20 w-28 opacity-80 sm:block sm:h-24 sm:w-36"}`}>
                <Image src={photo.url} alt={photo.alt || `Photo : ${item.title}`} fill sizes="(max-width: 640px) 144px, 176px" className="object-cover" />
              </div>
            ))}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden rounded-md bg-lp-accent px-3 py-3 text-white sm:px-5" aria-live="polite">
          <div className="flex items-center gap-3">
            <p className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-white/90 sm:block">En images</p>
            <div className="hidden h-6 w-px shrink-0 bg-white/35 sm:block" />
            <div className="min-w-0 overflow-hidden">
              <div className="lp-photo-info-ticker flex w-max items-center gap-10 whitespace-nowrap">
                {tickerSlides.map(({ item, photo }, index) => <p key={`${item.id}-${photo.url}-${index}`} className="text-base font-bold tracking-tight sm:text-lg"><span className="mr-3 text-white/70">●</span>{item.title}{item.content ? <span className="font-normal text-white/85"> — {item.content}</span> : null}</p>)}
              </div>
            </div>
          </div>
        </div>
        {slides.length > 1 && <div className="hidden shrink-0 gap-1 sm:flex" aria-label={`Photo ${active + 1} sur ${slides.length}`}>{slides.map(({ item, photo }, index) => <span key={`${item.id}-${photo.url}`} className={`h-1.5 rounded-full transition-all ${index === active ? "w-5 bg-white" : "w-1.5 bg-white/40"}`} />)}</div>}
      </div>
    </section>
  );
}
