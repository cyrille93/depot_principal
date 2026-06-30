import { db } from "@/lib/db";
import { TARIFS_MISE_EN_AVANT } from "@/lib/premium";

export const PARRAINAGE_DEFAUT = { taux: 5, dureeMois: 6 };

const CLE_TARIF: Record<string, string> = {
  URGENT: "tarif_urgent",
  TOP: "tarif_top",
  VIP: "tarif_vip",
  PREMIUM: "tarif_premium",
};

// Tarifs de mise en avant (par jour) lus depuis la base, avec repli sur les valeurs par défaut.
export async function getTarifsMiseEnAvant(): Promise<Record<string, number>> {
  try {
    const rows = await db.parametre.findMany({ where: { cle: { in: Object.values(CLE_TARIF) } } });
    const map = Object.fromEntries(rows.map((r: { cle: string; valeur: string }) => [r.cle, r.valeur]));
    const out: Record<string, number> = {};
    for (const [niveau, cle] of Object.entries(CLE_TARIF)) {
      const v = Number(map[cle]);
      out[niveau] = Number.isFinite(v) && v >= 0 ? v : TARIFS_MISE_EN_AVANT[niveau];
    }
    return out;
  } catch {
    return { ...TARIFS_MISE_EN_AVANT };
  }
}

export async function getParrainageConfig(): Promise<{ taux: number; dureeMois: number }> {
  try {
    const rows = await db.parametre.findMany({
      where: { cle: { in: ["parrainage_taux", "parrainage_duree_mois"] } },
    });
    const map = Object.fromEntries(rows.map((r: { cle: string; valeur: string }) => [r.cle, r.valeur]));
    const taux = Number(map["parrainage_taux"]);
    const duree = Number(map["parrainage_duree_mois"]);
    return {
      taux: Number.isFinite(taux) && taux > 0 ? taux : PARRAINAGE_DEFAUT.taux,
      dureeMois: Number.isFinite(duree) && duree > 0 ? duree : PARRAINAGE_DEFAUT.dureeMois,
    };
  } catch {
    return PARRAINAGE_DEFAUT;
  }
}

export async function getParametre(cle: string): Promise<string | null> {
  try {
    const row = await db.parametre.findUnique({ where: { cle } });
    return row?.valeur ?? null;
  } catch {
    return null;
  }
}

// --- Lancement : forfaits premium offerts ---
// Pendant la phase de lancement, tous les forfaits (mise en avant, boost…) sont
// gratuits jusqu'à cette date. Modifiable par l'admin via le paramètre
// "forfaits_gratuits_jusqu_au" (format AAAA-MM-JJ).
export const FORFAITS_GRATUITS_DEFAUT = "2026-09-30";

export async function forfaitsGratuits(): Promise<boolean> {
  const v = (await getParametre("forfaits_gratuits_jusqu_au")) ?? FORFAITS_GRATUITS_DEFAUT;
  const fin = new Date(`${v}T23:59:59`);
  if (Number.isNaN(fin.getTime())) return false;
  return new Date() <= fin;
}
