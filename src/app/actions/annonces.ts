"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const CATS = ["RENCONTRE", "MASSAGE", "SPA", "PRODUITS"] as const;
type Cat = (typeof CATS)[number];

export type AnnonceState = { ok?: boolean; error?: string };

export async function creerAnnonce(
  _prev: AnnonceState,
  formData: FormData
): Promise<AnnonceState> {
  const session = await auth();
  if (!session?.user) return { error: "Vous devez être connecté pour publier." };

  const titre = String(formData.get("titre") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorie = String(formData.get("categorie") ?? "");
  const villeId = String(formData.get("villeId") ?? "");
  const prix = Number(formData.get("prix") ?? 0);

  let medias: { floutes: number; src?: string }[] = [];
  try {
    medias = JSON.parse(String(formData.get("medias") ?? "[]"));
  } catch {
    medias = [];
  }

  if (titre.length < 3) return { error: "Le titre est trop court (3 caractères min)." };
  if (description.length < 10) return { error: "La description est trop courte." };
  if (!CATS.includes(categorie as Cat)) return { error: "Catégorie invalide." };
  if (!villeId) return { error: "Choisissez une ville." };
  if (!Number.isFinite(prix) || prix < 0) return { error: "Tarif invalide." };

  // S'assurer que l'utilisateur a un profil (création minimale sinon)
  const pseudo = (session.user.email ?? "pro").split("@")[0];
  await db.profil.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id, pseudo, villeId },
  });

  // L'annonce est publiée directement (modération a posteriori via signalements/admin)
  await db.annonce.create({
    data: {
      titre,
      description,
      categorie: categorie as Cat,
      prix: Math.round(prix),
      statut: "ACTIVE",
      userId: session.user.id,
      villeId,
      medias: {
        create: medias.map((m, o) => ({
          type: "PHOTO" as const,
          url: m?.src && m.src.startsWith("data:") ? m.src : `/media/placeholder-${o}.jpg`,
          floutee: (m?.floutes ?? 0) > 0,
          visagesFloutes: m?.floutes ?? 0,
          ordre: o,
        })),
      },
    },
  });

  return { ok: true };
}
// Modifier une annonce existante (propriétaire uniquement)
export async function modifierAnnonce(
  _prev: AnnonceState,
  formData: FormData
): Promise<AnnonceState> {
  const session = await auth();
  if (!session?.user) return { error: "Vous devez être connecté." };

  const id = String(formData.get("id") ?? "");
  const titre = String(formData.get("titre") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorie = String(formData.get("categorie") ?? "");
  const villeId = String(formData.get("villeId") ?? "");
  const prix = Number(formData.get("prix") ?? 0);

  if (!id) return { error: "Annonce introuvable." };
  if (titre.length < 3) return { error: "Le titre est trop court (3 caractères min)." };
  if (description.length < 10) return { error: "La description est trop courte." };
  if (!CATS.includes(categorie as Cat)) return { error: "Catégorie invalide." };
  if (!villeId) return { error: "Choisissez une ville." };
  if (!Number.isFinite(prix) || prix < 0) return { error: "Tarif invalide." };

  const a = await db.annonce.findUnique({ where: { id }, select: { userId: true } });
  if (!a || a.userId !== session.user.id) return { error: "Annonce introuvable ou non autorisée." };

  let medias: { floutes: number; src?: string }[] | null = null;
  const mediasRaw = formData.get("medias");
  if (mediasRaw != null) {
    try {
      medias = JSON.parse(String(mediasRaw));
    } catch {
      medias = null;
    }
  }

  await db.$transaction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: any) => {
      await tx.annonce.update({
        where: { id },
        data: { titre, description, categorie: categorie as Cat, prix: Math.round(prix), villeId },
      });
      // Si la galerie a été modifiée, on remplace l'ensemble des médias
      if (medias) {
        await tx.media.deleteMany({ where: { annonceId: id } });
        if (medias.length) {
          await tx.media.createMany({
            data: medias.map((m, o) => ({
              annonceId: id,
              type: "PHOTO" as const,
              url: m?.src && m.src.startsWith("data:") ? m.src : `/media/placeholder-${o}.jpg`,
              floutee: (m?.floutes ?? 0) > 0,
              visagesFloutes: m?.floutes ?? 0,
              ordre: o,
            })),
          });
        }
      }
    }
  );

  revalidatePath(`/profil/${id}`);
  revalidatePath("/compte");
  revalidatePath("/");
  return { ok: true };
}

// Mettre en pause / réactiver sa propre annonce
export async function basculerMonAnnonce(id: string): Promise<{ ok?: boolean; statut?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const a = await db.annonce.findUnique({ where: { id }, select: { userId: true, statut: true } });
  if (!a || a.userId !== session.user.id) return { error: "Annonce introuvable." };
  if (a.statut !== "ACTIVE" && a.statut !== "SUSPENDUE") {
    return { error: "Cette annonce ne peut pas être basculée dans son état actuel." };
  }
  const nouveau = a.statut === "ACTIVE" ? "SUSPENDUE" : "ACTIVE";
  await db.annonce.update({ where: { id }, data: { statut: nouveau } });
  revalidatePath("/compte");
  revalidatePath("/");
  return { ok: true, statut: nouveau };
}

// Supprimer sa propre annonce (suppression douce : statut SUPPRIMEE)
export async function supprimerMonAnnonce(id: string): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  const a = await db.annonce.findUnique({ where: { id }, select: { userId: true } });
  if (!a || a.userId !== session.user.id) return { error: "Annonce introuvable." };
  await db.annonce.update({ where: { id }, data: { statut: "SUPPRIMEE" } });
  revalidatePath("/compte");
  revalidatePath("/");
  return { ok: true };
}
