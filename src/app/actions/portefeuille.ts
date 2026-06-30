"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { creerNotification } from "@/lib/notifications";
import { getParrainageConfig } from "@/lib/parametres";

// Montant minimum d'une recharge
const MONTANT_MIN = 500;

// NOTE : la recharge en ligne (CinetPay) a été retirée pour la phase de lancement.
// `rechargerPortefeuille` ci-dessous (recharge simulée) reste dans le code mais
// n'est plus reliée à aucune interface — donc non appelable côté client. Elle
// conserve la logique de commissions de parrainage pour le jour où les paiements
// en ligne seront rebranchés.

export type RechargeState = { ok?: boolean; error?: string; nouveauSolde?: number };

export async function rechargerPortefeuille(
  montant: number,
  operateur: "ORANGE_MONEY" | "MTN_MOMO"
): Promise<RechargeState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour recharger." };
  const userId = session.user.id;

  if (!Number.isFinite(montant) || montant < MONTANT_MIN) {
    return { error: `Montant minimum : ${MONTANT_MIN} FCFA.` };
  }
  const m = Math.round(montant);

  const { taux: tauxPct } = await getParrainageConfig();
  const TAUX = tauxPct / 100;

  const now = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);
  const moisRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const libelleOp = operateur === "ORANGE_MONEY" ? "Orange Money" : "MTN MoMo";

  let notifParrain: { id: string; montant: number } | null = null;

  const nouveauSolde = await db.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
    // 1) La recharge Mobile Money est confirmée (paiement simulé pour l'instant)
    const recharge = await tx.recharge.create({
      data: { userId, montant: m, operateur, statut: "CONFIRMEE", refOperateur: "SIM-" + Date.now() },
    });

    // 2) L'INTÉGRALITÉ est créditée au filleul (la transaction s'effectue en entier)
    const porte = await tx.portefeuille.update({
      where: { userId },
      data: {
        solde: { increment: m },
        mouvements: { create: { type: "RECHARGE", montant: m, libelle: `Recharge ${libelleOp}` } },
      },
    });

    // 3) Commission VIRTUELLE au parrain : créditée par la plateforme,
    //    rien n'est prélevé sur la recharge du filleul.
    const parrainage = await tx.parrainage.findUnique({ where: { filleulId: userId } });
    if (parrainage && parrainage.statut === "ACTIF" && parrainage.dateFin >= now) {
      const commission = Math.round(m * TAUX);
      // Le parrain doit être actif ce mois (≥ 1 recharge ce mois) pour percevoir
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
            mouvements: {
              create: { type: "COMMISSION", montant: commission, libelle: `Commission parrainage (${tauxPct}%) — bonus plateforme` },
            },
          },
        });
        notifParrain = { id: parrainage.parrainId, montant: commission };
      } else if (commission > 0) {
        // Parrain inactif ce mois → commission perdue (non reportée)
        await tx.commission.create({
          data: { parrainageId: parrainage.id, rechargeId: recharge.id, montant: commission, moisRef, statut: "PERDUE" },
        });
      }
    }

    return porte.solde;
  });

  if (notifParrain) {
    const np: { id: string; montant: number } = notifParrain;
    await creerNotification(
      np.id,
      "COMMISSION",
      "Commission reçue",
      `Vous avez reçu ${np.montant.toLocaleString("fr-FR")} F de commission de parrainage.`,
      "/portefeuille"
    );
  }

  revalidatePath("/portefeuille");
  return { ok: true, nouveauSolde };
}

const MIN_TRANSFERT = 500;

export type TransfertState = { ok?: boolean; error?: string; nouveauSolde?: number; destinataire?: string };

// Transfert de solde virtuel vers un autre utilisateur actif (par email ou téléphone)
export async function transferer(identifiant: string, montant: number): Promise<TransfertState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const moi = session.user.id;

  const m = Math.floor(Number(montant));
  if (!Number.isFinite(m) || m < MIN_TRANSFERT) return { error: `Montant minimum : ${MIN_TRANSFERT} F.` };

  const id = (identifiant ?? "").trim();
  if (!id) return { error: "Indiquez le destinataire (email ou téléphone)." };
  const estEmail = id.includes("@");
  const dest = await db.user.findFirst({
    where: estEmail ? { email: id.toLowerCase() } : { telephone: id.replace(/\s+/g, "") },
    select: { id: true, statut: true, profil: { select: { pseudo: true } } },
  });
  if (!dest) return { error: "Destinataire introuvable." };
  if (dest.id === moi) return { error: "Vous ne pouvez pas vous transférer à vous-même." };
  if (dest.statut !== "ACTIF") return { error: "Le compte du destinataire n'est pas actif." };

  const porte = await db.portefeuille.findUnique({ where: { userId: moi }, select: { solde: true } });
  if (!porte || porte.solde < m) return { error: "Solde insuffisant." };

  const pseudoDest = dest.profil?.pseudo ?? "un utilisateur";

  const nouveauSolde = await db.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      const p = await tx.portefeuille.update({
        where: { userId: moi },
        data: {
          solde: { decrement: m },
          mouvements: { create: { type: "TRANSFERT_ENVOYE", montant: -m, libelle: `Transfert à ${pseudoDest}` } },
        },
      });
      await tx.portefeuille.upsert({
        where: { userId: dest.id },
        create: {
          userId: dest.id,
          solde: m,
          mouvements: { create: { type: "TRANSFERT_RECU", montant: m, libelle: "Transfert reçu" } },
        },
        update: {
          solde: { increment: m },
          mouvements: { create: { type: "TRANSFERT_RECU", montant: m, libelle: "Transfert reçu" } },
        },
      });
      await tx.transfertInterne.create({ data: { emetteurId: moi, destinataireId: dest.id, montant: m } });
      return p.solde;
    }
  );

  await creerNotification(
    dest.id,
    "SYSTEME",
    "Transfert reçu",
    `Vous avez reçu ${m.toLocaleString("fr-FR")} F sur votre portefeuille.`,
    "/portefeuille"
  );
  revalidatePath("/portefeuille");
  return { ok: true, nouveauSolde, destinataire: pseudoDest };
}
