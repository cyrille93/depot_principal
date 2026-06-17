"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { creerNotification } from "@/lib/notifications";

export type AvisState = { ok?: boolean; error?: string };

type Payload = {
  note: number;
  noteQualite?: number;
  notePonctualite?: number;
  noteAccueil?: number;
  noteRapportQualitePrix?: number;
  noteSatisfaction?: number;
  commentaire?: string;
};

const borne = (v?: number) => (typeof v === "number" && v >= 1 && v <= 5 ? Math.round(v) : null);

export async function laisserAvis(annonceId: string, p: Payload): Promise<AvisState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour laisser un avis." };
  const auteurId = session.user.id;

  const note = borne(p.note);
  if (!note) return { error: "Attribuez une note de 1 à 5 étoiles." };

  const annonce = await db.annonce.findUnique({ where: { id: annonceId }, select: { userId: true } });
  if (!annonce) return { error: "Annonce introuvable." };
  if (annonce.userId === auteurId) return { error: "Vous ne pouvez pas évaluer votre propre annonce." };

  const commentaire = (p.commentaire ?? "").trim().slice(0, 1000) || null;

  const criteres = {
    noteQualite: borne(p.noteQualite),
    notePonctualite: borne(p.notePonctualite),
    noteAccueil: borne(p.noteAccueil),
    noteRapportQualitePrix: borne(p.noteRapportQualitePrix),
    noteSatisfaction: borne(p.noteSatisfaction),
  };

  await db.avis.upsert({
    where: { annonceId_auteurId: { annonceId, auteurId } },
    create: { annonceId, auteurId, note, ...criteres, commentaire },
    update: { note, ...criteres, commentaire },
  });

  await recalculerReputation(annonce.userId);

  await creerNotification(
    annonce.userId,
    "AVIS",
    "Nouvel avis",
    `Vous avez reçu une note de ${note} étoile${note > 1 ? "s" : ""}.`,
    `/profil/${annonceId}`
  );

  revalidatePath(`/profil/${annonceId}`);
  revalidatePath("/");
  revalidatePath("/");
  return { ok: true };
}

// Recalcule la note moyenne et le nombre d'avis du professionnel (toutes ses annonces)
async function recalculerReputation(proUserId: string) {
  const annonces = await db.annonce.findMany({ where: { userId: proUserId }, select: { id: true } });
  const ids = annonces.map((a: { id: string }) => a.id);
  if (ids.length === 0) return;

  const agg = await db.avis.aggregate({
    where: { annonceId: { in: ids } },
    _avg: { note: true },
    _count: { _all: true },
  });
  const moyenne = agg._avg.note ?? 0;
  const nombre = agg._count._all ?? 0;
  // Score lissé : pénalise un faible nombre d'avis (évite qu'un seul 5★ domine)
  const score = nombre > 0 ? (moyenne * nombre) / (nombre + 3) : 0;

  try {
    await db.profil.update({
      where: { userId: proUserId },
      data: { noteMoyenne: moyenne, nombreAvis: nombre, scoreReputation: score },
    });
  } catch {
    // pas de profil : on ignore
  }
}
