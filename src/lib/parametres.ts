import { db } from "@/lib/db";
import { TARIFS_MISE_EN_AVANT } from "@/lib/premium";

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

// --- Contact WhatsApp support ---
// Numéro WhatsApp de l'équipe, utilisé pour les demandes de boost payant et le
// contact général une fois le lancement gratuit terminé. Réglable par l'admin
// (paramètre "whatsapp_support"), au format international sans le "+".
export async function getWhatsappSupport(): Promise<string | null> {
  const v = await getParametre("whatsapp_support");
  const n = (v ?? "").replace(/\D/g, "");
  return n.length >= 8 ? n : null;
}
