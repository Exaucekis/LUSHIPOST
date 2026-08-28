export const PREFERENCE_OPTIONS = [
  { value: "lubumbashi", label: "Lubumbashi" },
  { value: "haut-katanga", label: "Haut-Katanga" },
  { value: "rdc", label: "RDC" },
  { value: "politique", label: "Politique" },
  { value: "economie", label: "Économie" },
  { value: "societe", label: "Société" },
  { value: "sport", label: "Sport" },
  { value: "culture", label: "Culture" },
  { value: "afrique", label: "Afrique" },
  { value: "international", label: "International" },
  { value: "tech", label: "Tech" },
] as const;

export const PREFERENCE_VALUES = PREFERENCE_OPTIONS.map((option) => option.value);

export function normalizePreferences(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string =>
      typeof item === "string" && PREFERENCE_VALUES.includes(item as (typeof PREFERENCE_VALUES)[number])
  );
}
