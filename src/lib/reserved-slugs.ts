import { CATEGORY_SLUGS } from "@/lib/constants";

const RESERVED = new Set([
  "article", "admin", "api", "recherche", "video", "live",
  "feed.xml", "sitemap.xml", "manifest.json", "icons",
  "logo", "a-propos", "contact", "publicite", "partenariats",
  "carrieres", "charte-editoriale", "politique-correction",
  "verification", "sources", "mentions-legales", "confidentialite",
  ...CATEGORY_SLUGS,
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug);
}
