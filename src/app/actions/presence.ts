"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";

// Battement de présence : met à jour la dernière activité de l'utilisateur connecté.
export async function ping(): Promise<void> {
  const session = await auth();
  if (!session?.user) return;
  try {
    await db.user.update({ where: { id: session.user.id }, data: { derniereActivite: new Date() } });
  } catch {
    /* ignore */
  }
}
