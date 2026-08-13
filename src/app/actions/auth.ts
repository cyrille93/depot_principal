"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/validation";

export type AuthState = { error?: string };

export async function inscription(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email") ?? undefined,
    password: formData.get("password"),
    role: formData.get("role") ?? "CLIENT",
    telephone: formData.get("telephone") ?? undefined,
    villeId: formData.get("villeId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const { email, password, role, telephone, villeId } = parsed.data;
  const emailNorm = email && email.trim() ? email.trim().toLowerCase() : null;
  const telNorm = telephone && telephone.trim() ? telephone.replace(/\s+/g, "") : null;
  const pseudoSaisi = String(formData.get("pseudo") ?? "").trim().slice(0, 30);

  if (emailNorm) {
    const existing = await db.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return { error: "Un compte existe déjà avec cet email." };
    }
  }

  if (telNorm) {
    const telPris = await db.user.findUnique({ where: { telephone: telNorm } });
    if (telPris) {
      return { error: "Ce numéro de téléphone est déjà utilisé." };
    }
  }

  const pays = await db.pays.findUnique({
    where: { code: process.env.DEFAULT_COUNTRY_CODE ?? "CM" },
  });
  if (!pays) {
    return { error: "Pays par défaut introuvable — avez-vous lancé le seed ?" };
  }

  // Champ conservé en base (unique, non nul) mais la fonctionnalité de
  // parrainage n'est plus utilisée côté application.
  const codeParrainage = "CONF-" + crypto.randomUUID().slice(0, 6).toUpperCase();
  const pseudo = pseudoSaisi.length >= 2 ? pseudoSaisi : (emailNorm?.split("@")[0] ?? telNorm ?? "membre");
  const motDePasseHash = await hashPassword(password);

  await db.user.create({
    data: {
      email: emailNorm,
      telephone: telNorm,
      motDePasseHash,
      role,
      paysId: pays.id,
      locale: pays.locale,
      codeParrainage,
      profil: { create: { pseudo, villeId } },
    },
  });

  // Connecte directement après l'inscription.
  // Client → accueil (il vient chercher) ; Annonceur/Admin → son compte (où on l'invite à publier).
  const cible = role === "CLIENT" ? "/" : "/compte";
  await signIn("credentials", { identifiant: emailNorm ?? telNorm, password, redirectTo: cible });
  return {};
}

export async function connexion(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  try {
    await signIn("credentials", {
      identifiant: formData.get("identifiant"),
      password: formData.get("password"),
      redirectTo: "/compte",
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Identifiant ou mot de passe incorrect." };
    }
    throw e; // laisse passer la redirection de Next
  }
}
