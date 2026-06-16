"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { paire, type MessageUI } from "@/lib/messages";
import { creerNotification } from "@/lib/notifications";

export type EnvoiState = { ok?: boolean; error?: string };

// Démarrer (ou retrouver) une conversation avec le propriétaire d'une annonce, puis y aller
export async function demarrerConversation(annonceId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour envoyer un message." };
  const moi = session.user.id;

  const annonce = await db.annonce.findUnique({ where: { id: annonceId }, select: { userId: true } });
  if (!annonce) return { error: "Annonce introuvable." };
  if (annonce.userId === moi) return { error: "C'est votre propre annonce." };

  const [userAId, userBId] = paire(moi, annonce.userId);
  let conv = await db.conversation.findFirst({ where: { userAId, userBId, annonceId } });
  if (!conv) {
    conv = await db.conversation.create({ data: { userAId, userBId, annonceId } });
  }
  redirect(`/messages/${conv.id}`);
}

async function estParticipant(conversationId: string, userId: string) {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  });
  if (!conv) return false;
  return conv.userAId === userId || conv.userBId === userId;
}

async function autreParticipant(conversationId: string, userId: string): Promise<string | null> {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  });
  if (!conv) return null;
  if (conv.userAId !== userId && conv.userBId !== userId) return null;
  return conv.userAId === userId ? conv.userBId : conv.userAId;
}

// Démarrer (ou retrouver) une conversation directe avec un utilisateur (sans annonce)
export async function contacterUtilisateur(autreId: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const moi = session.user.id;
  if (autreId === moi) return { error: "Action impossible." };
  const cible = await db.user.findUnique({ where: { id: autreId }, select: { id: true } });
  if (!cible) return { error: "Utilisateur introuvable." };

  const [userAId, userBId] = paire(moi, autreId);
  let conv = await db.conversation.findFirst({ where: { userAId, userBId, annonceId: null } });
  if (!conv) conv = await db.conversation.create({ data: { userAId, userBId, annonceId: null } });
  redirect(`/messages/${conv.id}`);
}

export async function envoyerMessage(
  conversationId: string,
  contenu?: string,
  imageUrl?: string
): Promise<EnvoiState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const moi = session.user.id;
  const estAdmin = session.user.role === "ADMIN";

  const autre = await autreParticipant(conversationId, moi);
  if (!autre) return { error: "Conversation introuvable." };

  // L'administrateur ne peut pas être bloqué : ses messages passent toujours.
  if (!estAdmin) {
    const bloque = await db.blocage.findFirst({
      where: {
        OR: [
          { bloqueurId: moi, bloqueId: autre },
          { bloqueurId: autre, bloqueId: moi },
        ],
      },
    });
    if (bloque) return { error: "Cette conversation est bloquée." };
  }

  const texte = (contenu ?? "").trim().slice(0, 2000) || null;
  const image = imageUrl && imageUrl.startsWith("data:") ? imageUrl : null;
  if (!texte && !image) return { error: "Message vide." };

  await db.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      await tx.message.create({
        data: { conversationId, expediteurId: moi, contenu: texte, imageUrl: image },
      });
      await tx.conversation.update({ where: { id: conversationId }, data: { dernierAt: new Date() } });
    }
  );

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
  await creerNotification(autre, "MESSAGE", "Nouveau message", "Vous avez reçu un nouveau message.", `/messages/${conversationId}`);
  return { ok: true };
}

export async function bloquer(autreId: string): Promise<EnvoiState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  if (autreId === session.user.id) return { error: "Action impossible." };
  await db.blocage.upsert({
    where: { bloqueurId_bloqueId: { bloqueurId: session.user.id, bloqueId: autreId } },
    create: { bloqueurId: session.user.id, bloqueId: autreId },
    update: {},
  });
  revalidatePath("/messages");
  return { ok: true };
}

export async function debloquer(autreId: string): Promise<EnvoiState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  await db.blocage.deleteMany({ where: { bloqueurId: session.user.id, bloqueId: autreId } });
  revalidatePath("/messages");
  return { ok: true };
}

// Récupère le fil (et marque comme lus les messages reçus) — utilisé au chargement et en polling
export async function chargerFil(conversationId: string): Promise<{ messages: MessageUI[]; error?: string }> {
  const session = await auth();
  if (!session?.user) return { messages: [], error: "non connecté" };
  const moi = session.user.id;
  if (!(await estParticipant(conversationId, moi))) return { messages: [], error: "interdit" };

  await db.message.updateMany({
    where: { conversationId, lu: false, NOT: { expediteurId: moi } },
    data: { lu: true },
  });

  const rows = await db.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: MessageUI[] = (rows as any[]).map((m) => ({
    id: m.id,
    mien: m.expediteurId === moi,
    contenu: m.contenu,
    image: m.imageUrl,
    at: (m.createdAt as Date).toISOString(),
  }));
  return { messages };
}
