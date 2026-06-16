"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

async function exigerAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

async function setParam(cle: string, valeur: string) {
  await db.parametre.upsert({ where: { cle }, create: { cle, valeur }, update: { valeur } });
}

export async function enregistrerParrainage(
  taux: number,
  dureeMois: number
): Promise<{ ok?: boolean; error?: string }> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };
  const t = Math.round(Number(taux));
  const d = Math.round(Number(dureeMois));
  if (!Number.isFinite(t) || t < 0 || t > 100) return { error: "Taux invalide (0–100)." };
  if (!Number.isFinite(d) || d < 1 || d > 60) return { error: "Durée invalide (1–60 mois)." };
  await setParam("parrainage_taux", String(t));
  await setParam("parrainage_duree_mois", String(d));
  revalidatePath("/admin");
  revalidatePath("/compte");
  revalidatePath("/parrainage");
  return { ok: true };
}

export async function enregistrerLogo(dataUrl: string): Promise<{ ok?: boolean; error?: string }> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(dataUrl)) return { error: "Image invalide." };
  if (dataUrl.length > 3_000_000) return { error: "Image trop lourde (max ~2 Mo)." };
  await setParam("logo", dataUrl);
  revalidatePath("/");
  revalidatePath("/explorer");
  revalidatePath("/admin");
  return { ok: true };
}

export async function reinitialiserLogo(): Promise<{ ok?: boolean; error?: string }> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };
  try {
    await db.parametre.delete({ where: { cle: "logo" } });
  } catch {
    /* déjà absent */
  }
  revalidatePath("/");
  revalidatePath("/explorer");
  revalidatePath("/admin");
  return { ok: true };
}
