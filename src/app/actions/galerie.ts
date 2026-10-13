"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type GalerieState = { ok?: boolean; error?: string };

async function exigerAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

// Ajoute une vidéo à la galerie (admin). L'URL vient d'un upload Vercel Blob.
export async function ajouterVideoGalerie(
  titre: string,
  description: string,
  url: string
): Promise<GalerieState> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };

  const t = titre.trim();
  const d = description.trim();
  if (t.length < 2) return { error: "Indiquez un titre." };
  if (!url || !url.startsWith("http")) return { error: "Vidéo manquante ou invalide." };

  await db.videoGalerie.create({
    data: { titre: t.slice(0, 120), description: d.slice(0, 500) || null, url },
  });

  revalidatePath("/galerie");
  revalidatePath("/admin/galerie");
  return { ok: true };
}

// Supprime une vidéo de la galerie (admin).
export async function supprimerVideoGalerie(id: string): Promise<GalerieState> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };
  await db.videoGalerie.delete({ where: { id } }).catch(() => {});
  revalidatePath("/galerie");
  revalidatePath("/admin/galerie");
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────
// Interactions publiques : vues, j'aime, commentaires
// ─────────────────────────────────────────────────────────────

function nomAuteur(user: { profil?: { pseudo: string } | null }): string {
  return user.profil?.pseudo?.trim() || "Membre";
}

// Compte une vue. Appelée côté client au lancement de la lecture (1x/session).
export async function enregistrerVueVideo(id: string): Promise<{ ok: boolean }> {
  await db.videoGalerie
    .update({ where: { id }, data: { vues: { increment: 1 } } })
    .catch(() => {});
  return { ok: true };
}

export type LikeState = { ok?: boolean; aime?: boolean; total?: number; error?: string };

// Bascule le j'aime de l'utilisateur connecté sur une vidéo.
export async function basculerLikeVideo(videoId: string): Promise<LikeState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour aimer une vidéo." };
  const userId = session.user.id;

  const existe = await db.videoGalerieLike.findUnique({
    where: { videoId_userId: { videoId, userId } },
  });

  if (existe) {
    await db.videoGalerieLike.delete({ where: { videoId_userId: { videoId, userId } } });
  } else {
    await db.videoGalerieLike.create({ data: { videoId, userId } });
  }

  const total = await db.videoGalerieLike.count({ where: { videoId } });
  revalidatePath("/galerie");
  return { ok: true, aime: !existe, total };
}

export type CommentairePublic = { id: string; contenu: string; auteur: string; date: string };
export type CommentaireState = { ok?: boolean; error?: string; commentaire?: CommentairePublic };

// Ajoute un commentaire (utilisateur connecté).
export async function ajouterCommentaireVideo(
  videoId: string,
  contenu: string
): Promise<CommentaireState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour commenter." };
  const userId = session.user.id;

  const texte = contenu.trim();
  if (texte.length < 1) return { error: "Le commentaire est vide." };
  if (texte.length > 1000) return { error: "Commentaire trop long (1000 caractères max)." };

  const c = await db.videoGalerieCommentaire.create({
    data: { videoId, userId, contenu: texte },
    include: { user: { include: { profil: true } } },
  });

  revalidatePath("/galerie");
  return {
    ok: true,
    commentaire: { id: c.id, contenu: c.contenu, auteur: nomAuteur(c.user), date: "à l'instant" },
  };
}

// Supprime un commentaire (son auteur, ou un admin).
export async function supprimerCommentaireVideo(id: string): Promise<GalerieState> {
  const session = await auth();
  if (!session?.user) return { error: "Action non autorisée." };

  const c = await db.videoGalerieCommentaire.findUnique({ where: { id } });
  if (!c) return { ok: true };

  const estAdmin = session.user.role === "ADMIN";
  if (c.userId !== session.user.id && !estAdmin) return { error: "Action non autorisée." };

  await db.videoGalerieCommentaire.delete({ where: { id } }).catch(() => {});
  revalidatePath("/galerie");
  return { ok: true };
}
