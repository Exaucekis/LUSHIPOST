import { ArticleStatus, Prisma } from "@prisma/client";

/** Builds a status history row for use within the same transaction as an article update. */
export function statusHistoryEntry(
  articleId: string,
  fromStatus: ArticleStatus | null,
  toStatus: ArticleStatus,
  changedById: string | null,
  reason?: string | null
): Prisma.ArticleStatusHistoryCreateManyInput {
  return { articleId, fromStatus, toStatus, changedById, reason: reason || null };
}
