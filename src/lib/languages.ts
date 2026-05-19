// Liste prédéfinie des langues disponibles pour les experts.
export const LANGUAGES = [
  "Français",
  "Anglais",
  "Espagnol",
  "Allemand",
  "Italien",
  "Portugais",
  "Arabe",
  "Chinois",
  "Japonais",
  "Russe",
] as const;

export type Language = (typeof LANGUAGES)[number];
