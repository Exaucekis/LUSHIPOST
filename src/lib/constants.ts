export const SITE_NAME = "LUSHIPOST";
export const SITE_TAGLINE = "L'information au cœur de Lubumbashi.";
export const SITE_PHONE = "+243 970 824 872";
export const SITE_PHONE_HREF = "tel:+243970824872";
export const SITE_DESCRIPTION =
  "LUSHIPOST — Média d'information numérique basé à Lubumbashi. Actualités du Haut-Katanga, de la RDC, de l'Afrique et du monde.";

export const MAIN_NAV = [
  { label: "Accueil", href: "/" },
  { label: "RDC", href: "/rdc" },
  { label: "Lubumbashi", href: "/lubumbashi" },
  { label: "Haut-Katanga", href: "/haut-katanga" },
  { label: "Politique", href: "/politique" },
  { label: "Économie", href: "/economie" },
  { label: "Société", href: "/societe" },
  { label: "Santé", href: "/sante" },
  { label: "Enquête", href: "/enquete" },
  { label: "Sport", href: "/sport" },
  { label: "Culture", href: "/culture" },
  { label: "International", href: "/international" },
  { label: "Tech", href: "/tech" },
  { label: "Vidéo", href: "/video" },
] as const;

export const FOOTER_NAV = {
  rubriques: [
    { label: "Accueil", href: "/" },
    { label: "RDC", href: "/rdc" },
    { label: "Lubumbashi", href: "/lubumbashi" },
    { label: "Haut-Katanga", href: "/haut-katanga" },
    { label: "Enquête", href: "/enquete" },
    { label: "Santé", href: "/sante" },
    { label: "Afrique", href: "/afrique" },
    { label: "International", href: "/international" },
    { label: "Sport", href: "/sport" },
    { label: "Culture", href: "/culture" },
    { label: "Tech", href: "/tech" },
    { label: "Vidéo", href: "/video" },
  ],
  informations: [
    { label: "À propos", href: "/a-propos" },
    { label: "Contact", href: "/contact" },
    { label: "Publicité", href: "/publicite" },
    { label: "Partenariats", href: "/partenariats" },
    { label: "Carrières", href: "/carrieres" },
  ],
  editorial: [
    { label: "Charte éditoriale", href: "/charte-editoriale" },
    { label: "Politique de correction", href: "/politique-correction" },
    { label: "Fact-checking", href: "/verification" },
    { label: "Sources", href: "/sources" },
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/confidentialite" },
  ],
};

export const CATEGORY_SLUGS = [
  "lubumbashi",
  "haut-katanga",
  "rdc",
  "politique",
  "economie",
  "societe",
  "enquete",
  "justice",
  "sante",
  "education",
  "sport",
  "culture",
  "tech",
  "environnement",
  "afrique",
  "international",
  "opinion",
  "verification",
  "video",
] as const;

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  REDACTEUR_EN_CHEF: "Rédacteur en chef",
  JOURNALISTE: "Journaliste",
  EDITEUR: "Éditeur",
  MODERATEUR: "Modérateur",
  VIDEOASTE: "Vidéaste",
  ABONNE: "Abonné",
};

export const STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  EN_REVISION: "En révision",
  PROGRAMME: "Programmé",
  PUBLIE: "Publié",
  ARCHIVE: "Archivé",
};

export const FACT_CHECK_LABELS: Record<string, string> = {
  VRAI: "Vrai",
  FAUX: "Faux",
  TROMPEUR: "Trompeur",
  MANQUE_DE_CONTEXTE: "Manque de contexte",
  NON_VERIFIE: "Non vérifié",
};

export const FACT_CHECK_COLORS: Record<string, string> = {
  VRAI: "bg-emerald-600",
  FAUX: "bg-red-600",
  TROMPEUR: "bg-orange-600",
  MANQUE_DE_CONTEXTE: "bg-amber-600",
  NON_VERIFIE: "bg-zinc-600",
};
