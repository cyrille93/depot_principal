import { db } from "@/lib/db";

const TAUX = 5;
const DUREE_MOIS = 6;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://confiance.cm";

type UiType = "recharge" | "commission" | "bonus" | "premium" | "transfert_in" | "transfert_out";

const MAP_TYPE: Record<string, UiType> = {
  RECHARGE: "recharge",
  COMMISSION: "commission",
  BONUS: "bonus",
  ACHAT_PREMIUM: "premium",
  TRANSFERT_RECU: "transfert_in",
  TRANSFERT_ENVOYE: "transfert_out",
};

export type MouvementVue = { id: string; type: UiType; label: string; date: string; montant: number };

export type PortefeuilleData = {
  solde: number;
  estPro: boolean;
  actifCeMois: boolean;
  code: string;
  lien: string;
  filleulsInscrits: number;
  filleulsActifs: number;
  gainsGeneres: number;
  commissionsEnAttente: number;
  tauxCommission: number;
  dureeMois: number;
  mouvements: MouvementVue[];
};

type MouvementRow = { id: string; type: string; libelle: string; montant: number; createdAt: Date };

function dateFr(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export async function getPortefeuilleData(userId: string): Promise<PortefeuilleData> {
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  const [user, porte, parrainages, rechargesMois, gainsAgg, attenteAgg] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { codeParrainage: true, role: true } }),
    db.portefeuille.findUnique({
      where: { userId },
      include: { mouvements: { orderBy: { createdAt: "desc" }, take: 50 } },
    }),
    db.parrainage.findMany({ where: { parrainId: userId }, select: { filleulId: true } }),
    db.recharge.count({ where: { userId, statut: "CONFIRMEE", createdAt: { gte: debutMois } } }),
    db.commission.aggregate({ _sum: { montant: true }, where: { statut: "VERSEE", parrainage: { parrainId: userId } } }),
    db.commission.aggregate({ _sum: { montant: true }, where: { statut: "EN_ATTENTE", parrainage: { parrainId: userId } } }),
  ]);

  const filleulIds = parrainages.map((p: { filleulId: string }) => p.filleulId);
  let filleulsActifs = 0;
  if (filleulIds.length > 0) {
    const actifs = await db.recharge.findMany({
      where: { userId: { in: filleulIds }, statut: "CONFIRMEE", createdAt: { gte: debutMois } },
      select: { userId: true },
      distinct: ["userId"],
    });
    filleulsActifs = actifs.length;
  }

  const mouvements: MouvementVue[] = ((porte?.mouvements ?? []) as MouvementRow[]).map((m) => ({
    id: m.id,
    type: MAP_TYPE[m.type] ?? "bonus",
    label: m.libelle,
    date: dateFr(m.createdAt),
    montant: m.montant,
  }));

  const code = user?.codeParrainage ?? "";

  return {
    solde: porte?.solde ?? 0,
    estPro: user?.role === "PRO",
    actifCeMois: rechargesMois > 0,
    code,
    lien: `${BASE_URL}/inscription?ref=${code}`,
    filleulsInscrits: parrainages.length,
    filleulsActifs,
    gainsGeneres: gainsAgg._sum.montant ?? 0,
    commissionsEnAttente: attenteAgg._sum.montant ?? 0,
    tauxCommission: TAUX,
    dureeMois: DUREE_MOIS,
    mouvements,
  };
}
