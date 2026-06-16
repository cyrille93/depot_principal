"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

const CLES = ["cgu", "confidentialite", "mentions-legales"];

export async function enregistrerContenuPage(
  cle: string,
  titre: string,
  corps: string
): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Accès refusé." };
  if (!CLES.includes(cle)) return { error: "Page inconnue." };
  if (!titre.trim() || !corps.trim()) return { error: "Titre et contenu requis." };

  await db.contenuPage.upsert({
    where: { cle },
    create: { cle, titre: titre.trim(), corps },
    update: { titre: titre.trim(), corps },
  });
  revalidatePath(`/${cle}`);
  revalidatePath("/admin");
  return { ok: true };
}
