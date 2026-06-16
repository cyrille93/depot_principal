import fr from "./fr.json";
import en from "./en.json";

// Socle i18n (ticket P1-16). FR par défaut, EN prêt pour les régions
// anglophones du Cameroun (Buea, Limbe, Bamenda...).
export const dictionaries = { fr, en } as const;
export type Locale = keyof typeof dictionaries;
export const defaultLocale: Locale = "fr";

export function t(locale: Locale, key: keyof typeof fr): string {
  return dictionaries[locale][key] ?? dictionaries[defaultLocale][key] ?? key;
}
