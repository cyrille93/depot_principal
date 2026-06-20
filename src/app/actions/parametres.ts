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

export async function enregistrerTarifs(
  tarifs: { URGENT: number; TOP: number; VIP: number; PREMIUM: number },
): Promise<{ ok?: boolean; error?: string }> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };
  const cles: Record<string, string> = { URGENT: "tarif_urgent", TOP: "tarif_top", VIP: "tarif_vip", PREMIUM: "tarif_premium" };
  for (const [niveau, cle] of Object.entries(cles)) {
    const v = Math.round(Number(tarifs[niveau as keyof typeof tarifs]));
    if (!Number.isFinite(v) || v < 0 || v > 1_000_000) return { error: `Tarif ${niveau} invalide.` };
    await setParam(cle, String(v));
  }
  revalidatePath("/admin");
  revalidatePath("/premium");
  revalidatePath("/booster");
  return { ok: true };
}

export async function enregistrerLogo(dataUrl: string): Promise<{ ok?: boolean; error?: string }> {
  if (!(await exigerAdmin())) return { error: "Accès refusé." };
  if (!/^data:image\/(png|jpeg|webp);base64,/.test(dataUrl)) return { error: "Image invalide." };
  if (dataUrl.length > 3_000_000) return { error: "Image trop lourde (max ~2 Mo)." };
  await setParam("logo", dataUrl);
  revalidatePath("/");
  revalidatePath("/");
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
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
