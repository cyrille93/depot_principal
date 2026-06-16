// Données fictives pour visualiser le feed avant de brancher la vraie base
// (Phases 2-3). Pseudos et visuels sont des placeholders.

export type Statut = "Disponible" | "Répond vite" | "Occupé";
export type Badge = "VIP" | "Premium" | "Urgent" | "TOP" | null;

export type ProfilFictif = {
  id: string;
  pseudo: string;
  note: number;
  avis: number;
  categorie: "Massage" | "Rencontre" | "Spa";
  ville: string;
  distanceKm: number;
  prix: number; // FCFA
  statut: Statut;
  badge: Badge;
  enLigne: boolean;
  verifie: boolean;
  favori?: boolean;
  photo?: string;
};

export const PROFILS: ProfilFictif[] = [
  { id: "1", pseudo: "Sandra K.", note: 4.9, avis: 128, categorie: "Massage", ville: "Douala", distanceKm: 2.3, prix: 15000, statut: "Disponible", badge: null, enLigne: true, verifie: true },
  { id: "2", pseudo: "Léa", note: 4.7, avis: 86, categorie: "Rencontre", ville: "Douala", distanceKm: 3.1, prix: 20000, statut: "Répond vite", badge: "VIP", enLigne: false, verifie: true },
  { id: "3", pseudo: "Mia", note: 5.0, avis: 54, categorie: "Spa", ville: "Yaoundé", distanceKm: 1.2, prix: 10000, statut: "Disponible", badge: null, enLigne: true, verifie: true },
  { id: "4", pseudo: "Nora", note: 4.8, avis: 203, categorie: "Massage", ville: "Douala", distanceKm: 4.0, prix: 18000, statut: "Disponible", badge: "Premium", enLigne: false, verifie: true },
  { id: "5", pseudo: "Inès", note: 4.6, avis: 41, categorie: "Spa", ville: "Bafoussam", distanceKm: 2.8, prix: 12000, statut: "Disponible", badge: null, enLigne: true, verifie: true },
  { id: "6", pseudo: "Awa", note: 4.9, avis: 97, categorie: "Rencontre", ville: "Yaoundé", distanceKm: 5.2, prix: 14000, statut: "Répond vite", badge: "VIP", enLigne: false, verifie: true },
  { id: "7", pseudo: "Carine", note: 4.5, avis: 33, categorie: "Massage", ville: "Douala", distanceKm: 6.1, prix: 16000, statut: "Occupé", badge: null, enLigne: false, verifie: true },
  { id: "8", pseudo: "Dora", note: 4.8, avis: 72, categorie: "Spa", ville: "Kribi", distanceKm: 3.7, prix: 11000, statut: "Disponible", badge: null, enLigne: true, verifie: true },
  { id: "9", pseudo: "Flora", note: 4.7, avis: 58, categorie: "Rencontre", ville: "Buea", distanceKm: 8.4, prix: 13000, statut: "Disponible", badge: "Premium", enLigne: true, verifie: true },
];

export const CATEGORIES = ["Rencontre", "Massage", "Spa", "Produits adultes"] as const;

export const VILLES_CM = [
  "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua",
  "Ngaoundéré", "Bertoua", "Buea", "Limbe", "Kumba", "Kribi", "Ebolowa",
] as const;

export type TypeMouvement =
  | "recharge"
  | "commission"
  | "bonus"
  | "premium"
  | "transfert_in"
  | "transfert_out";

export type Mouvement = {
  id: string;
  type: TypeMouvement;
  label: string;
  montant: number; // signé, en FCFA
  date: string;
};

export const PORTEFEUILLE = {
  solde: 24500,
  code: "CONF-SK237",
  lien: "https://confiance.cm/r/CONF-SK237",
  filleulsInscrits: 12,
  filleulsActifs: 7,
  gainsGeneres: 18750,
  commissionsEnAttente: 2300,
  actifCeMois: true,
  tauxCommission: 5,
  dureeMois: 6,
};

export const MOUVEMENTS: Mouvement[] = [
  { id: "t1", type: "commission", label: "Commission — recharge de Léa", montant: 1000, date: "10 juin 2026" },
  { id: "t2", type: "recharge", label: "Recharge Orange Money", montant: 10000, date: "8 juin 2026" },
  { id: "t3", type: "premium", label: "Mise en avant — 7 jours", montant: -3000, date: "6 juin 2026" },
  { id: "t4", type: "commission", label: "Commission — recharge de Awa", montant: 750, date: "4 juin 2026" },
  { id: "t5", type: "transfert_out", label: "Transfert à Mia", montant: -5000, date: "2 juin 2026" },
  { id: "t6", type: "bonus", label: "Bonus de bienvenue", montant: 2000, date: "1 juin 2026" },
  { id: "t7", type: "commission", label: "Commission — recharge de Inès", montant: 550, date: "29 mai 2026" },
];

export const fcfa = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString("fr-FR") + " F";

export type Avis = {
  id: string;
  auteur: string;
  note: number;
  date: string;
  critere: string;
  commentaire: string;
};

export type ProfilDetail = ProfilFictif & {
  quartier: string;
  description: string;
  ancienneteMois: number;
  tauxReponse: number; // %
  delaiReponseMin: number;
  galerie: number; // nb de médias
  medias?: { url: string; floutee: boolean }[];
  criteres: { label: string; note: number }[];
  verif: { telephone: boolean; identite: boolean; selfie: boolean };
  avisListe: Avis[];
};

const DETAILS: Record<string, Partial<ProfilDetail>> = {
  "1": {
    quartier: "Akwa",
    description:
      "Massage professionnel dans un cadre calme et discret à Akwa. Sur rendez-vous, accueil soigné. Photos floutées pour préserver l'anonymat — vérification d'identité à jour.",
    galerie: 6,
    verif: { telephone: true, identite: true, selfie: true },
    avisListe: [
      { id: "a1", auteur: "Jean P.", note: 5, date: "Mars 2026", critere: "Qualité du service", commentaire: "Très professionnelle, ponctuelle et accueillante. Je recommande." },
      { id: "a2", auteur: "Client vérifié", note: 5, date: "Février 2026", critere: "Accueil", commentaire: "Cadre propre et discret, exactement comme décrit." },
      { id: "a3", auteur: "M. T.", note: 4, date: "Janvier 2026", critere: "Rapport qualité/prix", commentaire: "Bonne prestation, rien à redire." },
    ],
  },
};

function defautCriteres(note: number): { label: string; note: number }[] {
  const c = (x: number) => Math.max(0, Math.min(5, Math.round(x * 10) / 10));
  return [
    { label: "Qualité du service", note: c(note) },
    { label: "Respect du rendez-vous", note: c(note - 0.2) },
    { label: "Accueil", note: c(note) },
    { label: "Rapport qualité/prix", note: c(note - 0.3) },
    { label: "Satisfaction globale", note: c(note) },
  ];
}

export function getProfilDetail(id: string): ProfilDetail | null {
  const base = PROFILS.find((p) => p.id === id);
  if (!base) return null;
  const e = DETAILS[id] ?? {};
  return {
    ...base,
    quartier: e.quartier ?? "Centre-ville",
    description:
      e.description ??
      `${base.categorie} à ${base.ville}. Sur rendez-vous, cadre discret. Photos floutées pour préserver l'anonymat.`,
    ancienneteMois: e.ancienneteMois ?? 14,
    tauxReponse: e.tauxReponse ?? 96,
    delaiReponseMin: e.delaiReponseMin ?? 5,
    galerie: e.galerie ?? 4,
    criteres: e.criteres ?? defautCriteres(base.note),
    verif: e.verif ?? { telephone: true, identite: base.verifie, selfie: false },
    avisListe:
      e.avisListe ?? [
        { id: "x1", auteur: "Client vérifié", note: Math.round(base.note), date: "Février 2026", critere: "Satisfaction globale", commentaire: "Prestation conforme, je recommande." },
        { id: "x2", auteur: "Anonyme", note: Math.max(4, Math.round(base.note)), date: "Janvier 2026", critere: "Accueil", commentaire: "Accueil agréable et ponctuel." },
      ],
  };
}
