import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

type Video = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  duration?: number | null;
};

export function VideoSection({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;

  return (
    <section
      className="lp-gradient-editorial py-12 text-white sm:py-14"
      aria-labelledby="videos-section"
    >
      <div className="lp-container">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              {SITE_NAME} Vidéo
            </p>
            <h2 id="videos-section" className="text-2xl font-bold sm:text-3xl">
              Reportages &amp; interviews
            </h2>
          </div>
          <Link
            href="/video"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-white hover:gap-2"
          >
            Toutes les vidéos →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((video) => (
            <Link
              key={video.id}
              href={`/video/${video.slug}`}
              className="group overflow-hidden rounded-sm bg-black/30 transition-all duration-300 hover:bg-black/50 hover:shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden">
                {video.thumbnail && (
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover opacity-90 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lp-accent text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current pl-0.5" />
                  </span>
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-bold">
                    {Math.floor(video.duration / 60)}:
                    {String(video.duration % 60).padStart(2, "0")}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold leading-snug transition-colors group-hover:text-red-300">
                  {video.title}
                </h3>
                {video.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-white/60">
                    {video.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
