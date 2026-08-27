import type { Metadata } from "next";
import Link from "next/link";
import { getVideos } from "@/lib/data/articles";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} Reportages vidéo`,
  description: `Vidéos d'actualité, interviews, reportages et analyses de ${SITE_NAME}.`,
};

export default async function VideoPage() {
  const videos = await getVideos(24).catch(() => []);

  return (
    <div className="lp-container py-8">
      <header className="mb-8 border-b-2 border-lp-black pb-6">
        <h1 className="text-4xl font-bold">{SITE_NAME} Reportages vidéo</h1>
        <p className="mt-3 text-lp-gray">
          Reportages, interviews, conférences et formats courts depuis Lubumbashi et au-delà.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <Link key={video.id} href={`/video/${video.slug}`} className="lp-card group">
            <div className={`relative overflow-hidden ${video.isVertical ? "aspect-[9/16]" : "aspect-video"}`}>
              {video.thumbnail && (
                <Image
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lp-accent text-xl text-white">
                  ▶
                </span>
              </div>
              {video.duration && (
                <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-white">
                  {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, "0")}
                </span>
              )}
            </div>
            <div className="p-4">
              <h2 className="font-bold leading-snug group-hover:text-lp-accent">{video.title}</h2>
              {video.description && (
                <p className="mt-2 line-clamp-2 text-sm text-lp-gray">{video.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {videos.length === 0 && (
        <p className="py-12 text-center text-lp-gray">Aucune vidéo disponible pour le moment.</p>
      )}
    </div>
  );
}
