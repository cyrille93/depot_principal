"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { forfaitsGratuits } from "@/lib/parametres";
import { creerNotification } from "@/lib/notifications";

const NIVEAUX = ["URGENT", "VIP", "TOP", "PREMIUM"] as const;
type Niveau = (typeof NIVEAUX)[number];
function estNiveauValide(v: string): v is Niveau {
  return (NIVEAUX as readonly string[]).includes(v);
}

export type BoostState = { ok?: boolean; error?: string };

// Activation gratuite d'une mise en avant par son propriétaire, uniquement
// pendant la fenêtre de lancement (forfaits offerts). En dehors de cette
// fenêtre, le boost payant passe par une demande WhatsApp puis une
// activation manuelle par l'admin (voir boosterAnnonceAdmin ci-dessous) —
// il n'y a plus de paiement en ligne intégré à l'application.
export async function acheterMiseEnAvant(
  annonceId: string,
  niveau: string,
  jours: number
): Promise<BoostState> {
  const session = await auth();
  if (!session?.user) return { error: "Connectez-vous pour booster une annonce." };
  const userId = session.user.id;

  if (!estNiveauValide(niveau)) return { error: "Niveau de mise en avant invalide." };
  if (!Number.isInteger(jours) || jours < 1 || jours > 5) return { error: "La durée doit être de 1 à 5 jours." };

  const annonce = await db.annonce.findUnique({ where: { id: annonceId }, select: { userId: true } });
  if (!annonce || annonce.userId !== userId) return { error: "Annonce introuvable ou non autorisée." };

  const gratuit = await forfaitsGratuits();
  if (!gratuit) {
    return { error: "L'activation gratuite est terminée. Passez par WhatsApp pour booster votre annonce." };
  }

  const debut = new Date();
  const expire = new Date();
  expire.setDate(expire.getDate() + jours);

  await db.annonce.update({
    where: { id: annonceId },
    data: { miseEnAvant: niveau, estBoostee: true, boostDebut: debut, boostExpire: expire, boostMontant: 0 },
  });

  await creerNotification(
    userId,
    "SYSTEME",
    "Mise en avant activée",
    `Votre annonce est en ${niveau} pour ${jours} jour${jours > 1 ? "s" : ""}. Suivez le temps restant dans votre espace.`,
    "/booster/suivi"
  );

  revalidatePath("/");
  revalidatePath("/compte");
  revalidatePath("/booster/suivi");
  return { ok: true };
}

// Activation manuelle d'un boost par l'admin, après confirmation d'une
// demande/paiement reçue hors ligne (WhatsApp). Aucun contrôle de solde :
// c'est l'admin qui valide.
export async function boosterAnnonceAdmin(
  annonceId: string,
  niveau: string,
  jours: number
): Promise<BoostState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Accès refusé." };

  if (!estNiveauValide(niveau)) return { error: "Niveau de mise en avant invalide." };
  if (!Number.isInteger(jours) || jours < 1 || jours > 30) return { error: "Durée invalide (1 à 30 jours)." };

  const annonce = await db.annonce.findUnique({ where: { id: annonceId }, select: { userId: true, titre: true } });
  if (!annonce) return { error: "Annonce introuvable." };

  const debut = new Date();
  const expire = new Date();
  expire.setDate(expire.getDate() + jours);

  await db.annonce.update({
    where: { id: annonceId },
    data: { miseEnAvant: niveau, estBoostee: true, boostDebut: debut, boostExpire: expire },
  });

  await creerNotification(
    annonce.userId,
    "SYSTEME",
    "Mise en avant activée",
    `Votre annonce « ${annonce.titre} » est en ${niveau} pour ${jours} jour${jours > 1 ? "s" : ""}.`,
    "/booster/suivi"
  );

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/booster/suivi");
  return { ok: true };
}
