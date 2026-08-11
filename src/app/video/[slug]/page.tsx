import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await prisma.video.findUnique({ where: { slug } }).catch(() => null);
  if (!video) return { title: "Vidéo" };
  return { title: video.title, description: video.description || undefined };
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const video = await prisma.video.findUnique({ where: { slug } }).catch(() => null);
  if (!video) notFound();

  return (
    <div className="lp-container py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">{video.title}</h1>
        <div className={`relative mb-6 overflow-hidden bg-black ${video.isVertical ? "aspect-[9/16] max-h-[80vh] mx-auto" : "aspect-video"}`}>
          <iframe
            src={video.videoUrl}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {video.description && (
          <p className="text-lp-gray leading-relaxed">{video.description}</p>
        )}
      </div>
    </div>
  );
}
