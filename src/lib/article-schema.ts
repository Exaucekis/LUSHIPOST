import { z } from "zod";

export const articleFormSchema = z.object({
  title: z.string().min(5),
  // Généré depuis le titre côté serveur : ce détail technique reste invisible
  // au journaliste.
  slug: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10),
  categoryId: z.string(),
  status: z
    .enum(["BROUILLON", "EN_REVISION", "APPROUVE", "PROGRAMME", "PUBLIE", "REFUSE", "ARCHIVE"])
    .optional(),
  contentType: z.enum(["FAITS", "ANALYSE", "OPINION"]).optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  geoZone: z.string().optional(),
  scheduledAt: z.string().optional(),
});

export type ArticleFormValues = z.infer<typeof articleFormSchema>;

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
