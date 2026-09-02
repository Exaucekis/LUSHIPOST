import prisma from "@/lib/prisma";
import { VideoSubmissionForm } from "@/components/admin/VideoSubmissionForm";
import { VideoApprovalButton } from "@/components/admin/VideoApprovalButton";
import { DeleteVideoButton } from "@/components/admin/DeleteVideoButton";

export default async function AdminVideosPage() {
  const videos = await prisma.video.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Reportages vidéo</h1>
      <p className="mb-7 text-lp-gray">Validez les reportages envoyés par la rédaction et publiez vos propres formats.</p>
      <VideoSubmissionForm endpoint="/api/admin/videos" isAdmin />
      <div className="grid gap-4">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white px-6 py-4">
            <div>
              <p className="font-medium">{video.title}</p>
              <p className="text-xs text-lp-gray">{video.platform} · {video.publishedAt ? "Publié" : "En attente d’approbation"}</p>
            </div>
            <div className="flex items-center gap-3">
              {video.publishedAt ? <a href={`/video/${video.slug}`} target="_blank" className="text-sm text-lp-accent hover:underline">Voir →</a> : <VideoApprovalButton id={video.id} />}
              <DeleteVideoButton videoId={video.id} adminLabel="Supprimer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
