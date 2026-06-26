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

// Suppression DÉFINITIVE d'un compte (efface réellement toutes les données liées).
export async function supprimerCompte(userId: string): Promise<ModState> {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Accès réservé aux administrateurs." };
  if (session.user.id === userId) return { error: "Vous ne pouvez pas supprimer votre propre compte." };

  const u = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!u) return { error: "Utilisateur introuvable." };
  if (u.role === "ADMIN") return { error: "Impossible de supprimer un administrateur." };

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.$transaction(async (tx: any) => {
      // Récupère les identifiants liés pour effacer les tables sans cascade
      const recharges = await tx.recharge.findMany({ where: { userId }, select: { id: true } });
      const parrainages = await tx.parrainage.findMany({
        where: { OR: [{ parrainId: userId }, { filleulId: userId }] },
        select: { id: true },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rechargeIds = recharges.map((r: any) => r.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parrainageIds = parrainages.map((p: any) => p.id);

      // 1) Commissions (liées aux recharges ou aux parrainages de l'utilisateur)
      await tx.commission.deleteMany({
        where: { OR: [{ rechargeId: { in: rechargeIds } }, { parrainageId: { in: parrainageIds } }] },
      });
      // 2) Recharges de l'utilisateur
      await tx.recharge.deleteMany({ where: { userId } });
      // 3) Parrainages où il est parrain ou filleul
      await tx.parrainage.deleteMany({ where: { OR: [{ parrainId: userId }, { filleulId: userId }] } });
      // 4) Transferts internes émis/reçus
      await tx.transfertInterne.deleteMany({ where: { OR: [{ emetteurId: userId }, { destinataireId: userId }] } });
      // 5) Messages envoyés
      await tx.message.deleteMany({ where: { expediteurId: userId } });
      // 6) Avis rédigés
      await tx.avis.deleteMany({ where: { auteurId: userId } });
      // 7) Signalements émis
      await tx.signalement.deleteMany({ where: { auteurId: userId } });

      // 8) Le compte : cascade sur profil, annonces, favoris, portefeuille,
      //    vérifications, options, blocages, notifications, conversations, demandes…
      await tx.user.delete({ where: { id: userId } });
    });
  } catch {
    return { error: "Échec de la suppression (des données liées subsistent)." };
  }

  revalidatePath("/admin");
  return { ok: true };
}
