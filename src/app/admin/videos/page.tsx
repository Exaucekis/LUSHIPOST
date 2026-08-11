import prisma from "@/lib/prisma";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Vidéos</h1>
      <div className="grid gap-4">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center justify-between rounded-lg border bg-white px-6 py-4">
            <div>
              <p className="font-medium">{video.title}</p>
              <p className="text-xs text-lp-gray">{video.platform} · {video.viewCount} vues</p>
            </div>
            <a href={`/video/${video.slug}`} target="_blank" className="text-sm text-lp-accent hover:underline">
              Voir →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
