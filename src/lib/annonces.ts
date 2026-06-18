import { db } from "@/lib/db";
import type { ProfilFictif, ProfilDetail, Avis, Badge } from "@/lib/mock";

const BADGE_PAR_NIVEAU: Record<string, Badge> = {
  URGENT: "Urgent",
  VIP: "VIP",
  TOP: "TOP",
  PREMIUM: "Premium",
};

const CAT: Record<string, "Massage" | "Rencontre" | "Spa"> = {
  RENCONTRE: "Rencontre",
  MASSAGE: "Massage",
  SPA: "Spa",
  PRODUITS: "Spa",
};

type AvisRow = {
  id: string;
  note: number;
  createdAt: Date;
  commentaire: string | null;
  noteQualite: number | null;
  notePonctualite: number | null;
  noteAccueil: number | null;
  noteRapportQualitePrix: number | null;
  noteSatisfaction: number | null;
  auteur: { profil: { pseudo: string } | null };
};

// Distance déterministe en attendant la géolocalisation (Phase 3).
function pseudoDistance(id: string): number {
  let s = 0;
  for (const c of id) s += c.charCodeAt(0);
  return Math.round(((s % 80) / 10 + 1) * 10) / 10;
}

function moisFr(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(d);
}

function ancienneteMois(d: Date): number {
  const now = new Date();
  return Math.max(0, (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()));
}

type AnnonceAvecRelations = NonNullable<Awaited<ReturnType<typeof chargerDetail>>>;

function versCarte(a: {
  id: string;
  categorie: string;
  prix: number;
  estBoostee: boolean;
  boostExpire?: Date | null;
  miseEnAvant?: string;
  medias?: { url: string; ordre: number }[];
  ville: { nom: string };
  user: { niveauVerification: number; profil: { pseudo: string; noteMoyenne: number; nombreAvis: number; disponible?: boolean } | null };
}): ProfilFictif {
  const p = a.user.profil;
  // La mise en avant n'est valable que si elle n'est pas expirée (0 à 5 jours) — sinon standard
  const actif = !!a.boostExpire && new Date(a.boostExpire) > new Date();
  const badge: Badge = actif && a.miseEnAvant ? BADGE_PAR_NIVEAU[a.miseEnAvant] ?? null : null;
  const premiere = (a.medias ?? []).slice().sort((x, y) => x.ordre - y.ordre)[0]?.url;
  const photo = premiere && (premiere.startsWith("data:") || premiere.startsWith("http")) ? premiere : undefined;
  return {
    id: a.id,
    pseudo: p?.pseudo ?? "Profil",
    note: p?.noteMoyenne ?? 0,
    avis: p?.nombreAvis ?? 0,
    categorie: CAT[a.categorie] ?? "Massage",
    ville: a.ville.nom,
    distanceKm: pseudoDistance(a.id),
    prix: a.prix,
    statut: p?.disponible === false ? "Occupé" : "Disponible",
    badge,
    enLigne: false,
    verifie: a.user.niveauVerification >= 1,
    photo,
  };
}

const CATS_VALIDES = ["RENCONTRE", "MASSAGE", "SPA", "PRODUITS"];
const TIER_MAP: Record<string, string> = { urgent: "URGENT", vip: "VIP", top: "TOP", premium: "PREMIUM" };

export type FiltresAnnonces = { villeId?: string; service?: string; compte?: string; q?: string; tier?: string; tri?: string };

export async function listerAnnonces(filtres?: FiltresAnnonces, userId?: string): Promise<ProfilFictif[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { statut: "ACTIVE" };
  if (filtres?.villeId) where.villeId = filtres.villeId;
  if (filtres?.service && CATS_VALIDES.includes(filtres.service)) where.categorie = filtres.service;
  if (filtres?.compte === "verifie") where.user = { niveauVerification: { gte: 1 } };

  // Filtres de mise en avant (Urgent / VIP / TOP / Premium), uniquement si non expirés
  if (filtres?.tier) {
    const niveaux = filtres.tier
      .split(",")
      .map((s) => TIER_MAP[s.trim()])
      .filter(Boolean);
    if (niveaux.length) {
      where.miseEnAvant = { in: niveaux };
      where.boostExpire = { gt: new Date() };
    }
  }

  if (filtres?.q && filtres.q.trim()) {
    const q = filtres.q.trim();
    where.OR = [
      { titre: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const annonces = await db.annonce.findMany({
    where,
    include: { ville: true, user: { include: { profil: true } }, medias: { select: { url: true, ordre: true } } },
  });

  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (a: any) => {
    const boostActif = !!a.boostExpire && new Date(a.boostExpire).getTime() > now && a.miseEnAvant !== "STANDARD";
    return {
      montant: boostActif ? a.boostMontant ?? 0 : 0, // 0 = annonce non monétisée
      note: a.user?.profil?.noteMoyenne ?? 0,
      score: a.user?.profil?.scoreReputation ?? 0,
      dispo: a.user?.profil?.disponible === false ? 0 : 1,
      created: new Date(a.createdAt).getTime(),
    };
  };

  const tri = filtres?.tri;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  annonces.sort((a: any, b: any) => {
    const ma = meta(a);
    const mb = meta(b);
    // 1) Monétisées toujours avant les non monétisées ; plus le boost payé est élevé, plus l'annonce est haute
    if (mb.montant !== ma.montant) return mb.montant - ma.montant;
    // 2) Tri secondaire choisi (s'applique surtout aux non monétisées, ou à montant égal)
    if (tri === "note" && mb.note !== ma.note) return mb.note - ma.note;
    if (tri === "dispo" && mb.dispo !== ma.dispo) return mb.dispo - ma.dispo;
    if (tri !== "note" && tri !== "dispo" && mb.score !== ma.score) return mb.score - ma.score;
    // 3) La plus récente d'abord
    return mb.created - ma.created;
  });

  const cartes = annonces.map(versCarte);
  return marquerFavoris(cartes, userId);
}

async function marquerFavoris(cartes: ProfilFictif[], userId?: string): Promise<ProfilFictif[]> {
  if (!userId || cartes.length === 0) return cartes;
  const favs = await db.favori.findMany({
    where: { userId, annonceId: { in: cartes.map((c) => c.id) } },
    select: { annonceId: true },
  });
  const set = new Set(favs.map((f: { annonceId: string }) => f.annonceId));
  return cartes.map((c) => ({ ...c, favori: set.has(c.id) }));
}

export async function listerFavoris(userId: string): Promise<ProfilFictif[]> {
  const favs = await db.favori.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { annonce: { include: { ville: true, user: { include: { profil: true } } } } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return favs.map((f: any) => ({ ...versCarte(f.annonce), favori: true }));
}

function chargerDetail(id: string) {
  return db.annonce.findUnique({
    where: { id },
    include: {
      ville: true,
      medias: true,
      user: { include: { profil: true } },
      avis: { include: { auteur: { include: { profil: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
}

function moyenne(valeurs: (number | null)[]): number | null {
  const v = valeurs.filter((x): x is number => x != null);
  if (v.length === 0) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 10) / 10;
}

export async function getAnnonceDetail(id: string): Promise<ProfilDetail | null> {
  const a: AnnonceAvecRelations | null = await chargerDetail(id);
  if (!a) return null;

  const carte = versCarte(a);
  const p = a.user.profil;

  const critereOu = (vals: (number | null)[], def: number) => moyenne(vals) ?? def;
  const base = p?.noteMoyenne ?? 0;
  const avisRows: AvisRow[] = a.avis;
  const criteres = [
    { label: "Qualité du service", note: critereOu(avisRows.map((x) => x.noteQualite), base) },
    { label: "Respect du rendez-vous", note: critereOu(avisRows.map((x) => x.notePonctualite), base) },
    { label: "Accueil", note: critereOu(avisRows.map((x) => x.noteAccueil), base) },
    { label: "Rapport qualité/prix", note: critereOu(avisRows.map((x) => x.noteRapportQualitePrix), base) },
    { label: "Satisfaction globale", note: critereOu(avisRows.map((x) => x.noteSatisfaction), base) },
  ];

  const avisListe: Avis[] = avisRows.map((x) => ({
    id: x.id,
    auteur: x.auteur.profil?.pseudo ?? "Client vérifié",
    note: x.note,
    date: moisFr(x.createdAt),
    critere: "Satisfaction globale",
    commentaire: x.commentaire ?? "",
  }));

  return {
    ...carte,
    quartier: a.ville.region ?? "Centre-ville",
    description: a.description,
    ancienneteMois: ancienneteMois(a.user.profil?.createdAt ?? a.createdAt),
    tauxReponse: p?.tauxReponse ?? 0,
    delaiReponseMin: 5,
    galerie: a.medias.length || 1,
    medias: (a.medias as { url: string; floutee: boolean; ordre: number }[])
      .slice()
      .sort((x, y) => x.ordre - y.ordre)
      .map((m) => ({ url: m.url, floutee: m.floutee })),
    criteres,
    verif: {
      telephone: a.user.telephoneVerifie,
      identite: a.user.identiteVerifiee,
      selfie: a.user.selfieVerifie,
    },
    telephoneContact: a.user.telephone,
    avisListe,
  };
}

export type MonAvis = {
  note: number;
  noteQualite: number | null;
  notePonctualite: number | null;
  noteAccueil: number | null;
  noteRapportQualitePrix: number | null;
  noteSatisfaction: number | null;
  commentaire: string | null;
};

// Le visiteur courant peut-il évaluer cette annonce, et a-t-il déjà un avis ?
export async function getContexteAvis(
  annonceId: string,
  userId?: string
): Promise<{ peutEvaluer: boolean; monAvis: MonAvis | null }> {
  if (!userId) return { peutEvaluer: false, monAvis: null };
  const annonce = await db.annonce.findUnique({ where: { id: annonceId }, select: { userId: true } });
  if (!annonce || annonce.userId === userId) return { peutEvaluer: false, monAvis: null };

  const a = await db.avis.findUnique({
    where: { annonceId_auteurId: { annonceId, auteurId: userId } },
    select: {
      note: true,
      noteQualite: true,
      notePonctualite: true,
      noteAccueil: true,
      noteRapportQualitePrix: true,
      noteSatisfaction: true,
      commentaire: true,
    },
  });
  return { peutEvaluer: true, monAvis: a ?? null };
}
