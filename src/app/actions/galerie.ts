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
