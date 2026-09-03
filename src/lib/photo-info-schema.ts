import { z } from "zod";

export const photoInfoSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(160),
  content: z.string().trim().max(500).optional(),
  photos: z.array(z.object({
    url: z.string().url("Entrez un lien image valide."),
    alt: z.string().trim().max(160).optional(),
  })).min(1, "Ajoutez au moins une photo.").max(4, "Maximum 4 photos."),
  isActive: z.boolean().optional(),
});
