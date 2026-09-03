import { z } from "zod";

const optionalTrimmedString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).optional()
);

const galleryImageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().optional(),
  caption: z.string().trim().optional(),
});

export const articleFormSchema = z.object({
  title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères."),
  // Généré depuis le titre côté serveur : ce détail technique reste invisible
  // au journaliste.
  slug: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(3, "Le slug doit contenir au moins 3 caractères.").optional()
  ),
  subtitle: optionalTrimmedString,
  excerpt: optionalTrimmedString,
  content: z.string().trim().min(10, "Le contenu doit contenir au moins 10 caractères."),
  categoryId: z.string().min(1, "Veuillez sélectionner une catégorie."),
  status: z
    .enum(["BROUILLON", "EN_REVISION", "APPROUVE", "PROGRAMME", "PUBLIE", "REFUSE", "ARCHIVE"])
    .optional(),
  contentType: z.enum(["FAITS", "ANALYSE", "OPINION"]).optional(),
  featuredImage: optionalTrimmedString,
  featuredImageAlt: optionalTrimmedString,
  gallery: z.array(galleryImageSchema).max(4, "Une info peut contenir jusqu’à 4 photos.").optional(),
  geoZone: optionalTrimmedString,
  scheduledAt: optionalTrimmedString,
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
