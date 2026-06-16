import { db } from "@/lib/db";

export const PARRAINAGE_DEFAUT = { taux: 5, dureeMois: 6 };

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
