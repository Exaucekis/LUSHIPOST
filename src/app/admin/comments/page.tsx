import prisma from "@/lib/prisma";
import { CommentModerationActions } from "@/components/admin/CommentModerationActions";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    include: {
      article: { select: { title: true, slug: true } },
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  }).catch(() => []);

  const statusLabels: Record<string, string> = {
    EN_ATTENTE: "En attente",
    APPROUVE: "Approuvé",
    SIGNALE: "Signalé",
    SUPPRIME: "Supprimé",
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Commentaires</h1>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg border bg-white p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="min-w-0 break-words text-sm font-medium">
                {comment.user?.name || comment.authorName || "Anonyme"}
              </span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs">
                {statusLabels[comment.status]}
              </span>
            </div>
            <p className="text-sm text-lp-gray">{comment.content}</p>
            <p className="mt-2 text-xs text-lp-gray">
              Sur : {comment.article.title}
            </p>
            <CommentModerationActions id={comment.id} status={comment.status} />
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-lp-gray py-12">Aucun commentaire.</p>
        )}
      </div>
    </div>
  );
}
