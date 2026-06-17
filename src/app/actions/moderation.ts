"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { recomputeNiveau } from "@/lib/verification";
import { creerNotification } from "@/lib/notifications";

export type ModState = { ok?: boolean; error?: string };

async function exigerAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function validerAnnonce(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const a = await db.annonce.update({ where: { id }, data: { statut: "ACTIVE" }, select: { userId: true, titre: true } });
  await creerNotification(a.userId, "ANNONCE_VALIDEE", "Annonce validée", `Votre annonce « ${a.titre} » est maintenant en ligne.`, `/profil/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function refuserAnnonce(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const a = await db.annonce.update({ where: { id }, data: { statut: "REFUSEE" }, select: { userId: true, titre: true } });
  await creerNotification(a.userId, "ANNONCE_REFUSEE", "Annonce refusée", `Votre annonce « ${a.titre} » n'a pas été approuvée.`, "/compte");
  revalidatePath("/admin");
  return { ok: true };
}

export async function traiterSignalement(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  await db.signalement.update({ where: { id }, data: { statut: "TRAITE" } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function validerVerification(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const v = await db.verification.findUnique({ where: { id }, select: { userId: true, type: true } });
  if (!v) return { error: "Demande introuvable." };
  const champ =
    v.type === "TELEPHONE" ? "telephoneVerifie" : v.type === "IDENTITE" ? "identiteVerifiee" : "selfieVerifie";
  await db.verification.update({ where: { id }, data: { statut: "VALIDE" } });
  await db.user.update({ where: { id: v.userId }, data: { [champ]: true } });
  await recomputeNiveau(v.userId);
  const libelle = v.type === "TELEPHONE" ? "Téléphone vérifié" : v.type === "IDENTITE" ? "Pièce d'identité vérifiée" : "Selfie vérifié";
  await creerNotification(v.userId, "VERIFICATION", libelle, "Votre vérification a été approuvée. Le badge vérifié apparaît sur votre profil.", "/verification");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function refuserVerification(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  await db.verification.update({ where: { id }, data: { statut: "REFUSE" } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function suspendreAnnonce(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const a = await db.annonce.update({ where: { id }, data: { statut: "SUSPENDUE" }, select: { userId: true, titre: true } });
  await creerNotification(a.userId, "ANNONCE_REFUSEE", "Annonce suspendue", `Votre annonce « ${a.titre} » a été suspendue par la modération.`, "/compte");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function reactiverAnnonce(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const a = await db.annonce.update({ where: { id }, data: { statut: "ACTIVE" }, select: { userId: true, titre: true } });
  await creerNotification(a.userId, "ANNONCE_VALIDEE", "Annonce remise en ligne", `Votre annonce « ${a.titre} » est de nouveau visible.`, `/profil/${id}`);
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function supprimerAnnonceAdmin(id: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const a = await db.annonce.update({ where: { id }, data: { statut: "SUPPRIMEE" }, select: { userId: true, titre: true } });
  await creerNotification(a.userId, "ANNONCE_REFUSEE", "Annonce supprimée", `Votre annonce « ${a.titre} » a été supprimée par la modération.`, "/compte");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function suspendreCompte(userId: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  const u = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!u) return { error: "Utilisateur introuvable." };
  if (u.role === "ADMIN") return { error: "Impossible de suspendre un administrateur." };
  await db.user.update({ where: { id: userId }, data: { statut: "SUSPENDU" } });
  revalidatePath("/admin");
  return { ok: true };
}

export async function reactiverCompte(userId: string): Promise<ModState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  await db.user.update({ where: { id: userId }, data: { statut: "ACTIF" } });
  revalidatePath("/admin");
  return { ok: true };
}
