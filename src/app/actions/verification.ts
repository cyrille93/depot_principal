"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { recomputeNiveau } from "@/lib/verification";
import { paire } from "@/lib/messages";

// Tarif de la vérification de compte (badge vérifié) — réglé manuellement via le chat admin.
const TARIF_VERIFICATION = 10000;

export type VerifState = { ok?: boolean; error?: string; code?: string };

// --- Téléphone (SMS simulé en développement) ---
export async function envoyerCodeTelephone(): Promise<VerifState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const code = String(Math.floor(1000 + Math.random() * 9000));
  await db.verification.deleteMany({
    where: { userId: session.user.id, type: "TELEPHONE", statut: "EN_ATTENTE" },
  });
  await db.verification.create({
    data: { userId: session.user.id, type: "TELEPHONE", statut: "EN_ATTENTE", documentUrl: `code:${code}` },
  });
  // En production, ce code partirait par SMS. En développement, on le renvoie pour pouvoir tester.
  return { ok: true, code };
}

export async function confirmerTelephone(code: string): Promise<VerifState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const v = await db.verification.findFirst({
    where: { userId: session.user.id, type: "TELEPHONE", statut: "EN_ATTENTE" },
    orderBy: { createdAt: "desc" },
  });
  if (!v || v.documentUrl !== `code:${code.trim()}`) return { error: "Code incorrect." };
  await db.verification.update({ where: { id: v.id }, data: { statut: "VALIDE", documentUrl: null } });
  await db.user.update({ where: { id: session.user.id }, data: { telephoneVerifie: true } });
  await recomputeNiveau(session.user.id);
  revalidatePath("/verification");
  revalidatePath("/compte");
  return { ok: true };
}

// --- Pièce d'identité / Selfie (upload → revue par l'admin) ---
export async function soumettrePiece(
  type: "IDENTITE" | "SELFIE",
  imageUrl: string
): Promise<VerifState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  if (!imageUrl || !imageUrl.startsWith("data:")) return { error: "Veuillez joindre une image." };

  await db.verification.deleteMany({
    where: { userId: session.user.id, type, statut: "EN_ATTENTE" },
  });
  await db.verification.create({
    data: { userId: session.user.id, type, statut: "EN_ATTENTE", documentUrl: imageUrl },
  });
  revalidatePath("/verification");
  revalidatePath("/admin");
  return { ok: true };
}

// --- Vérification de compte payante (10 000 FCFA) réglée via le chat admin ---
// Ouvre (ou retrouve) une conversation directe avec l'administrateur, en y
// déposant un premier message d'intention, puis redirige vers la messagerie.
export async function ouvrirChatVerification(): Promise<VerifState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const moi = session.user.id;

  const admin = await db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });
  if (!admin) return { error: "Aucun administrateur disponible pour le moment." };
  if (admin.id === moi) return { error: "Vous êtes administrateur." };

  const [userAId, userBId] = paire(moi, admin.id);
  let conv = await db.conversation.findFirst({ where: { userAId, userBId, annonceId: null } });
  if (!conv) {
    conv = await db.conversation.create({ data: { userAId, userBId, annonceId: null } });
    await db.message.create({
      data: {
        conversationId: conv.id,
        expediteurId: moi,
        contenu: `Bonjour, je souhaite faire vérifier mon compte (badge vérifié). J'ai bien noté le tarif de ${TARIF_VERIFICATION.toLocaleString("fr-FR")} FCFA.`,
      },
    });
    await db.conversation.update({ where: { id: conv.id }, data: { dernierAt: new Date() } });
  }

  redirect(`/messages/${conv.id}`);
}
