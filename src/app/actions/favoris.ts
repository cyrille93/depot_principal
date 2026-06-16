"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function toggleFavori(
  annonceId: string
): Promise<{ favori?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour aimer une annonce." };
  const userId = session.user.id;

  const existe = await db.favori.findUnique({
    where: { userId_annonceId: { userId, annonceId } },
  });

  if (existe) {
    await db.favori.delete({ where: { userId_annonceId: { userId, annonceId } } });
    revalidatePath("/favoris");
    return { favori: false };
  }

  await db.favori.create({ data: { userId, annonceId } });
  revalidatePath("/favoris");
  return { favori: true };
}
