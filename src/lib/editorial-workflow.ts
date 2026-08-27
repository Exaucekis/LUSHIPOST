import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

const MODERATION_ROLES = [
  Role.SUPER_ADMIN,
  Role.REDACTEUR_EN_CHEF,
  Role.EDITEUR,
];

export async function notifyModerators(articleId: string, title: string) {
  const moderators = await prisma.user.findMany({
    where: { role: { in: MODERATION_ROLES }, isActive: true },
    select: { id: true },
  });

  if (moderators.length === 0) return;

  await prisma.notification.createMany({
    data: moderators.map(({ id }) => ({
      userId: id,
      articleId,
      type: "MODERATION",
      title: "Publication à valider",
      body: `« ${title} » a été soumise pour validation.`,
      url: `/admin/articles/${articleId}`,
    })),
  });
}

export async function notifyJournalist(
  userId: string | null,
  articleId: string,
  title: string,
  approved: boolean,
  reason?: string,
  scheduledAt?: Date | null
) {
  if (!userId) return;

  await prisma.notification.create({
    data: {
      userId,
      articleId,
      type: "MODERATION",
      title: approved ? "Publication approuvée" : "Publication refusée",
      body: approved
        ? scheduledAt
          ? `« ${title} » est approuvée et sera publiée le ${scheduledAt.toLocaleString("fr-FR")}.`
          : `« ${title} » est approuvée et visible sur le site.`
        : `« ${title} » a été refusée : ${reason}`,
      url: `/journaliste/articles/${articleId}`,
    },
  });
}
