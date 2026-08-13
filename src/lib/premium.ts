// Tarifs de mise en avant par jour (FCFA). Module partagé client + serveur
// (ne pas mettre dans un fichier "use server", qui n'exporte que des fonctions).
export const TARIFS_MISE_EN_AVANT: Record<string, number> = {
  URGENT: 1000,
  TOP: 1500,
  VIP: 2000,
  PREMIUM: 3000,
};

export type NiveauBoost = "URGENT" | "VIP" | "TOP" | "PREMIUM";

// Détail de ce que fait chaque forfait — affiché tel quel dans le compte
// annonceur et sur l'écran de boost, pour que le client voie tout avant de
// choisir. L'ordre du tableau suit l'ordre croissant de visibilité (le
// classement réel dans le feed est PREMIUM > TOP > VIP > URGENT > Standard,
// cf. lib/annonces.ts).
export const FORFAITS_BOOST: {
  v: NiveauBoost;
  label: string;
  accroche: string;
  avantages: string[];
  badgeClass: string;
}[] = [
  {
    v: "URGENT",
    label: "Urgent",
    accroche: "Signalez une disponibilité immédiate",
    avantages: [
      "Badge « Urgent » affiché sur la vignette de l'annonce",
      "Remonte au-dessus de toutes les annonces standards dans les résultats",
      "Idéal pour annoncer une disponibilité de dernière minute",
    ],
    badgeClass: "bg-etoile text-sur-vert",
  },
  {
    v: "VIP",
    label: "VIP",
    accroche: "Une meilleure place, un badge qui attire l'œil",
    avantages: [
      "Badge « VIP » affiché sur la vignette de l'annonce",
      "Passe devant les annonces Urgent et Standard dans le classement",
      "Visibilité renforcée pendant toute la durée choisie",
    ],
    badgeClass: "bg-vip text-white",
  },
  {
    v: "TOP",
    label: "TOP",
    accroche: "Parmi les toutes premières annonces affichées",
    avantages: [
      "Badge « TOP » affiché sur la vignette de l'annonce",
      "Position juste derrière les annonces Premium, devant VIP et Urgent",
      "Très forte exposition sur la page d'accueil et les recherches",
    ],
    badgeClass: "bg-action-verte text-white",
  },
  {
    v: "PREMIUM",
    label: "Premium",
    accroche: "La visibilité maximale sur toute la plateforme",
    avantages: [
      "Badge « Premium » affiché sur la vignette de l'annonce",
      "Toujours en tête des résultats, devant tous les autres niveaux",
      "Le meilleur choix pour une visibilité continue pendant le boost",
    ],
    badgeClass: "bg-feuille text-sur-vert",
  },
];
