// Liste prédéfinie de thématiques pour les experts et podcasts.
// Stockées sous forme de chaîne séparée par virgules dans `expert_profiles.expertise`.

export const TOPICS = [
  "Marketing",
  "Tech",
  "IA",
  "Business",
  "Entrepreneuriat",
  "Finance",
  "Santé",
  "Bien-être",
  "Développement personnel",
  "Éducation",
  "Design",
  "Productivité",
  "Lifestyle",
  "Sport",
  "Culture",
] as const;

export type Topic = (typeof TOPICS)[number];

/** Parse une chaîne expertise en liste de thématiques nettoyées. */
export function parseTopics(input: string | null | undefined): string[] {
  if (!input) return [];
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Sérialise une liste de thématiques pour stockage. */
export function serializeTopics(topics: string[]): string {
  return topics.join(", ");
}
