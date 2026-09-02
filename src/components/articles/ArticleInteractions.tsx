"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, MessageCircle, SendHorizonal } from "lucide-react";
import { useState } from "react";

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  user?: { id: string; name: string } | null;
  authorName?: string | null;
};

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

interface ArticleInteractionsProps {
  articleId: string;
  articleSlug: string;
  initialComments: CommentItem[];
  initialLikeCount: number;
  initialLikedByMe: boolean;
}

export function ArticleInteractions({
  articleId,
  articleSlug,
  initialComments,
  initialLikeCount,
  initialLikedByMe,
}: ArticleInteractionsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(initialLikedByMe);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [likeError, setLikeError] = useState<string | null>(null);

  const authenticated = !!session?.user;

  const handleLike = async () => {
    if (!authenticated) {
      setLikeError("Connectez-vous pour aimer cet article.");
      return;
    }

    try {
      setLikeError(null);
      const response = await fetch(`/api/articles/${articleSlug}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) throw new Error(data?.error || "Impossible de mettre à jour le like.");
      setLiked(Boolean(data?.liked));
      setLikeCount(Number(data?.count || 0));
    } catch (error) {
      setLikeError(error instanceof Error ? error.message : "Impossible de mettre à jour le like.");
    }
  };

  const handleSubmitComment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!authenticated) {
      setCommentError("Connectez-vous pour commenter cet article.");
      return;
    }

    const nextComment = comment.trim();
    if (!nextComment || nextComment.length < 2) {
      setCommentError("Votre commentaire doit contenir au moins 2 caractères.");
      return;
    }

    try {
      setIsSubmitting(true);
      setCommentError(null);
      const response = await fetch(`/api/articles/${articleSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextComment, articleId }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) throw new Error(data?.error || "Impossible d’ajouter le commentaire.");
      if (data?.comment) {
        setComments((previous) => [data.comment, ...previous]);
      }
      setComment("");
    } catch (error) {
      setCommentError(error instanceof Error ? error.message : "Impossible d’ajouter le commentaire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3 text-sm font-medium text-lp-gray">
          <button
            type="button"
            onClick={handleLike}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 transition ${
              liked ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-white text-lp-gray hover:border-red-200 hover:text-red-700"
            }`}
            aria-label={liked ? "Retirer le like" : "Ajouter un like"}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {liked ? "Aimé" : "J’aime"}
          </button>
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {comments.length} commentaire{comments.length > 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-sm font-semibold text-lp-black">{likeCount} like{likeCount > 1 ? "s" : ""}</span>
      </div>

      {likeError && <p className="mb-4 text-sm text-red-700">{likeError}</p>}

      {authenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
          <label htmlFor="article-comment" className="block text-sm font-semibold text-lp-black">
            Ajouter un commentaire
          </label>
          <textarea
            id="article-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Partagez votre avis sur cet article..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-lp-accent focus:bg-white"
          />
          {commentError && <p className="text-sm text-red-700">{commentError}</p>}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-lp-gray">{comment.length}/1000</span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-lp-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendHorizonal className="h-4 w-4" />
              {isSubmitting ? "Envoi..." : "Publier"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-lp-gray">
          Connectez-vous pour commenter et aimer cet article. {" "}
          <Link href={`/connexion?callbackUrl=/article/${articleSlug}`} className="font-semibold text-lp-accent hover:underline">
            Se connecter
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-lp-gray">Aucun commentaire pour le moment. Soyez le premier à réagir.</p>
        ) : (
          comments.map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-semibold text-lp-black">
                  {item.user?.name || item.authorName || "Abonné"}
                </span>
                <time className="text-xs text-lp-gray" dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-lp-gray">{item.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
