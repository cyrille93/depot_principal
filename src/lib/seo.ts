// Données et helpers pour les pages SEO /annonces/[ville]/[categorie]

export const MARQUE_SEO = "Rose Annonce";

// URL publique du site (à définir en production via NEXT_PUBLIC_SITE_URL)
// Fallback de prod par sécurité : on n'expose jamais localhost en ligne.
const URL_DEFAUT = process.env.NODE_ENV === "production" ? "https://roseannonce.com" : "http://localhost:3000";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? URL_DEFAUT).replace(/\/$/, "");

export type CategorieSeo = {
  slug: string;
  enum: "RENCONTRE" | "MASSAGE" | "SPA" | "PRODUITS";
  titre: string; // libellé pour les titres (« Massages à … »)
  intro: string; // texte d'introduction
};

export const CATEGORIES_SEO: CategorieSeo[] = [
  {
    slug: "rencontres",
    enum: "RENCONTRE",
    titre: "Rencontres",
    intro:
      "Découvrez des annonces de rencontres et accompagnement à {ville}. Profils vérifiés, avis réels après prestation et messagerie sécurisée directement sur la plateforme.",
  },
  {
    slug: "massage",
    enum: "MASSAGE",
    titre: "Massages",
    intro:
      "Trouvez un service de massage et bien-être à {ville}. Comparez les profils, consultez les avis et contactez sans quitter la plateforme.",
  },
  {
    slug: "spa",
    enum: "SPA",
    titre: "Spa",
    intro:
      "Parcourez les offres de spa et détente à {ville}. Des prestataires notés par la communauté, avec photos et disponibilité en temps réel.",
  },
  {
    slug: "produits-adultes",
    enum: "PRODUITS",
    titre: "Produits adultes",
    intro:
      "Annonces de produits adultes à {ville} : jouets, accessoires et plus. Vendeurs notés et échanges sécurisés via la messagerie intégrée.",
  },
];

export function categorieParSlug(slug: string): CategorieSeo | undefined {
  return CATEGORIES_SEO.find((c) => c.slug === slug);
}

export function slugCategorie(enumValue: string): string {
  return CATEGORIES_SEO.find((c) => c.enum === enumValue)?.slug ?? "rencontres";
}
