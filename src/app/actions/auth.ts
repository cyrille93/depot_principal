"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signupSchema } from "@/lib/validation";
import { getParrainageConfig } from "@/lib/parametres";

export type AuthState = { error?: string };

export async function inscription(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "CLIENT",
    telephone: formData.get("telephone"),
    villeId: formData.get("villeId"),
    codeParrain: formData.get("codeParrain") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const { email, password, role, telephone, villeId, codeParrain } = parsed.data;
  const emailNorm = email.trim().toLowerCase();
  const telNorm = telephone.replace(/\s+/g, "");
  const pseudoSaisi = String(formData.get("pseudo") ?? "").trim().slice(0, 30);

  const existing = await db.user.findUnique({ where: { email: emailNorm } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const telPris = await db.user.findUnique({ where: { telephone: telNorm } });
  if (telPris) {
    return { error: "Ce numéro de téléphone est déjà utilisé." };
  }

  const pays = await db.pays.findUnique({
    where: { code: process.env.DEFAULT_COUNTRY_CODE ?? "CM" },
  });
  if (!pays) {
    return { error: "Pays par défaut introuvable — avez-vous lancé le seed ?" };
  }

  // Parrain éventuel : seuls les comptes annonceurs (PRO) peuvent parrainer
  let parrain = null;
  if (codeParrain) {
    parrain = await db.user.findUnique({ where: { codeParrainage: codeParrain } });
    if (!parrain) {
      return { error: "Code de parrainage invalide." };
    }
    if (parrain.role !== "PRO") {
      return { error: "Seuls les comptes annonceurs peuvent parrainer." };
    }
  }

  const codeParrainage = "CONF-" + crypto.randomUUID().slice(0, 6).toUpperCase();
  const pseudo = pseudoSaisi.length >= 2 ? pseudoSaisi : emailNorm.split("@")[0];
  const motDePasseHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email: emailNorm,
      telephone: telNorm,
      motDePasseHash,
      role,
      paysId: pays.id,
      locale: pays.locale,
      codeParrainage,
      profil: { create: { pseudo, villeId } },
      portefeuille: { create: { solde: 0 } },
    },
  });

  // Relation de parrainage (durée configurable côté admin)
  if (parrain) {
    const { dureeMois } = await getParrainageConfig();
    const dateFin = new Date();
    dateFin.setMonth(dateFin.getMonth() + dureeMois);
    await db.parrainage.create({
      data: { parrainId: parrain.id, filleulId: user.id, codeUtilise: codeParrain!, dateFin },
    });
  }

  // Connecte directement après l'inscription.
  // Client → accueil (il vient chercher) ; Annonceur/Admin → son compte (où on l'invite à publier).
  const cible = role === "CLIENT" ? "/" : "/compte";
  await signIn("credentials", { identifiant: emailNorm, password, redirectTo: cible });
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
