"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function definirDisponibilite(disponible: boolean): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous." };
  try {
    await db.profil.update({ where: { userId: session.user.id }, data: { disponible } });
  } catch {
    return { error: "Profil introuvable." };
  }
  revalidatePath("/compte");
  revalidatePath("/");
  revalidatePath("/");
  return { ok: true };
}
