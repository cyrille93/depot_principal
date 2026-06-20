"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TARIFS_MISE_EN_AVANT } from "@/lib/premium";
import { getTarifsMiseEnAvant } from "@/lib/parametres";
import { creerNotification } from "@/lib/notifications";

const NIVEAUX = ["URGENT", "VIP", "TOP", "PREMIUM"];

export type BoostState = { ok?: boolean; error?: string };

export async function acheterMiseEnAvant(
  annonceId: string,
  niveau: string,
  jours: number
): Promise<BoostState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour booster une annonce." };
  const userId = session.user.id;

  if (!NIVEAUX.includes(niveau)) return { error: "Niveau de mise en avant invalide." };
  if (!Number.isInteger(jours) || jours < 1 || jours > 5) return { error: "La durée doit être de 1 à 5 jours." };

  const annonce = await db.annonce.findUnique({ where: { id: annonceId }, select: { userId: true } });
  if (!annonce || annonce.userId !== userId) return { error: "Annonce introuvable ou non autorisée." };

  const tarifs = await getTarifsMiseEnAvant();
  const cout = (tarifs[niveau] ?? TARIFS_MISE_EN_AVANT[niveau]) * jours;
  const porte = await db.portefeuille.findUnique({ where: { userId }, select: { solde: true } });
  if (!porte || porte.solde < cout) {
    return { error: "Solde insuffisant — rechargez votre portefeuille." };
  }

  const debut = new Date();
  const expire = new Date();
  expire.setDate(expire.getDate() + jours);

  await db.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      await tx.portefeuille.update({
        where: { userId },
        data: {
          solde: { decrement: cout },
          mouvements: {
            create: { type: "ACHAT_PREMIUM", montant: -cout, libelle: `Mise en avant ${niveau} (${jours} j)` },
          },
        },
      });
      await tx.annonce.update({
        where: { id: annonceId },
        data: { miseEnAvant: niveau, estBoostee: true, boostDebut: debut, boostExpire: expire, boostMontant: cout },
      });
    }
  );

  await creerNotification(
    userId,
    "SYSTEME",
    "Mise en avant activée",
    `Votre annonce est en ${niveau} pour ${jours} jour${jours > 1 ? "s" : ""}. Suivez le temps restant dans votre espace.`,
    "/booster/suivi"
  );

  revalidatePath("/");
  revalidatePath("/compte");
  revalidatePath("/portefeuille");
  revalidatePath("/booster/suivi");
  return { ok: true };
}
