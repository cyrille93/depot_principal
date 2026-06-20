import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { creerNotification } from "@/lib/notifications";
import { getParrainageConfig } from "@/lib/parametres";

// Crédite le portefeuille (et la commission de parrainage) lorsqu'une recharge
// est CONFIRMÉE par CinetPay. Idempotent : ne crédite qu'une seule fois.
export async function crediterRechargeConfirmee(rechargeId: string): Promise<{ ok: boolean }> {
  const recharge = await db.recharge.findUnique({ where: { id: rechargeId } });
  if (!recharge) return { ok: false };
  if (recharge.statut === "CONFIRMEE") return { ok: true }; // déjà créditée

  const userId = recharge.userId;
  const m = recharge.montant;
  const libelleOp = recharge.operateur === "ORANGE_MONEY" ? "Orange Money" : "MTN MoMo";

  const { taux: tauxPct } = await getParrainageConfig();
  const TAUX = tauxPct / 100;
  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const moisRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  let notifParrain: { id: string; montant: number } | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.$transaction(async (tx: any) => {
    // Anti-doublon dans la transaction
    const fresh = await tx.recharge.findUnique({ where: { id: rechargeId }, select: { statut: true } });
    if (!fresh || fresh.statut === "CONFIRMEE") return;
    await tx.recharge.update({ where: { id: rechargeId }, data: { statut: "CONFIRMEE" } });

    await tx.portefeuille.update({
      where: { userId },
      data: {
        solde: { increment: m },
        mouvements: { create: { type: "RECHARGE", montant: m, libelle: `Recharge ${libelleOp}` } },
      },
    });

    const parrainage = await tx.parrainage.findUnique({ where: { filleulId: userId } });
    if (parrainage && parrainage.statut === "ACTIF" && parrainage.dateFin >= now) {
      const commission = Math.round(m * TAUX);
      const parrainActif = await tx.recharge.count({
        where: { userId: parrainage.parrainId, statut: "CONFIRMEE", createdAt: { gte: debutMois } },
      });
      if (commission > 0 && parrainActif > 0) {
        await tx.commission.create({
          data: { parrainageId: parrainage.id, rechargeId: recharge.id, montant: commission, moisRef, statut: "VERSEE" },
        });
        await tx.portefeuille.update({
          where: { userId: parrainage.parrainId },
          data: {
            solde: { increment: commission },
            mouvements: { create: { type: "COMMISSION", montant: commission, libelle: `Commission parrainage (${tauxPct}%) — bonus plateforme` } },
          },
        });
        notifParrain = { id: parrainage.parrainId, montant: commission };
      } else if (commission > 0) {
        await tx.commission.create({
          data: { parrainageId: parrainage.id, rechargeId: recharge.id, montant: commission, moisRef, statut: "PERDUE" },
        });
      }
    }
  });

  if (notifParrain) {
    const np = notifParrain as { id: string; montant: number };
    await creerNotification(
      np.id,
      "COMMISSION",
      "Commission reçue",
      `Vous avez reçu ${np.montant.toLocaleString("fr-FR")} F de commission de parrainage.`,
      "/portefeuille",
    );
  }

  revalidatePath("/portefeuille");
  return { ok: true };
}
