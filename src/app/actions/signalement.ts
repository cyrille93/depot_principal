"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const MOTIFS = ["FAUX_PROFIL", "CONTENU_INAPPROPRIE", "HARCELEMENT", "ARNAQUE"];
const CIBLES = ["PROFIL", "ANNONCE", "MESSAGE"];

export type SignalState = { ok?: boolean; error?: string };

export async function signaler(
  cibleType: string,
  cibleId: string,
  motif: string
): Promise<SignalState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour signaler." };
  if (!CIBLES.includes(cibleType) || !MOTIFS.includes(motif)) return { error: "Signalement invalide." };

  // On ne signale pas sa propre annonce
  if (cibleType === "ANNONCE") {
    const a = await db.annonce.findUnique({ where: { id: cibleId }, select: { userId: true } });
    if (a?.userId === session.user.id) return { error: "Vous ne pouvez pas signaler votre propre annonce." };
  }

  // Évite les doublons ouverts du même auteur sur la même cible
  const existe = await db.signalement.findFirst({
    where: {
      auteurId: session.user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cibleType: cibleType as any,
      cibleId,
      statut: "OUVERT",
    },
  });
  if (existe) return { error: "Vous avez déjà signalé cet élément. Notre équipe va l'examiner." };

  await db.signalement.create({
    data: {
      auteurId: session.user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cibleType: cibleType as any,
      cibleId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      motif: motif as any,
    },
  });
  revalidatePath("/admin");
  return { ok: true };
}
