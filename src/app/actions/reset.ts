"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { creerNotification } from "@/lib/notifications";

export type ResetState = { ok?: boolean; error?: string; motDePasse?: string };

async function exigerAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

// Mot de passe temporaire lisible (sans caractères ambigus)
function genererTemporaire(longueur = 8): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < longueur; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// 1) L'utilisateur demande une réinitialisation (public). Réponse générique (ne révèle pas l'existence du compte).
export async function demanderReset(identifiant: string): Promise<ResetState> {
  const id = (identifiant ?? "").trim();
  if (id.length < 3) return { error: "Saisissez votre e-mail ou téléphone." };

  const estEmail = id.includes("@");
  const user = estEmail
    ? await db.user.findUnique({ where: { email: id.toLowerCase() } })
    : await db.user.findUnique({ where: { telephone: id.replace(/\s+/g, "") } });

  if (user) {
    // Évite les doublons : une seule demande ouverte par compte
    const existante = await db.demandeReset.findFirst({ where: { userId: user.id, statut: "OUVERTE" } });
    if (!existante) {
      await db.demandeReset.create({ data: { userId: user.id, identifiant: id } });
      revalidatePath("/admin");
    }
  }
  // Toujours la même réponse, que le compte existe ou non
  return { ok: true };
}

// 2) L'admin génère un mot de passe temporaire pour une demande
export async function genererMotDePasseTemporaire(demandeId: string): Promise<ResetState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };

  const demande = await db.demandeReset.findUnique({ where: { id: demandeId } });
  if (!demande || demande.statut !== "OUVERTE") return { error: "Demande introuvable ou déjà traitée." };

  const temporaire = genererTemporaire();
  const hash = await hashPassword(temporaire);

  await db.user.update({
    where: { id: demande.userId },
    data: { motDePasseHash: hash, doitChangerMotDePasse: true },
  });
  await db.demandeReset.update({
    where: { id: demandeId },
    data: { statut: "TRAITEE", traiteeAt: new Date() },
  });
  await creerNotification(
    demande.userId,
    "SYSTEME",
    "Mot de passe réinitialisé",
    "Un mot de passe temporaire a été généré. Connectez-vous avec, vous devrez le changer immédiatement.",
    "/connexion",
  );

  revalidatePath("/admin");
  // Le mot de passe en clair n'est renvoyé qu'à l'admin (jamais stocké en clair)
  return { ok: true, motDePasse: temporaire };
}

// 3) L'admin rejette une demande
export async function rejeterDemandeReset(demandeId: string): Promise<ResetState> {
  if (!(await exigerAdmin())) return { error: "Accès réservé aux administrateurs." };
  await db.demandeReset.update({ where: { id: demandeId }, data: { statut: "REJETEE", traiteeAt: new Date() } });
  revalidatePath("/admin");
  return { ok: true };
}

// 4) L'utilisateur connecté change son mot de passe (1re connexion forcée ou volontaire)
export async function changerMonMotDePasse(nouveau: string): Promise<ResetState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vous devez être connecté." };
  if (!nouveau || nouveau.length < 6) return { error: "Le mot de passe doit faire au moins 6 caractères." };

  const hash = await hashPassword(nouveau);
  await db.user.update({
    where: { id: session.user.id },
    data: { motDePasseHash: hash, doitChangerMotDePasse: false },
  });
  return { ok: true };
}
