"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type AdminCompteState = { ok?: boolean; error?: string };

async function exigerAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

// Crédite le portefeuille d'un compte (action réservée à l'admin).
export async function crediterCompte(userId: string, montant: number): Promise<AdminCompteState> {
  if (!(await exigerAdmin())) return { error: "Non autorisé." };
  const m = Math.round(montant);
  if (!Number.isFinite(m) || m <= 0) return { error: "Montant invalide." };

  const porte = await db.portefeuille.findUnique({ where: { userId }, select: { id: true } });
  if (!porte) return { error: "Portefeuille introuvable." };

  await db.$transaction([
    db.portefeuille.update({ where: { id: porte.id }, data: { solde: { increment: m } } }),
    db.mouvementPortefeuille.create({
      data: { portefeuilleId: porte.id, type: "BONUS", montant: m, libelle: "Crédit administrateur" },
    }),
  ]);

  revalidatePath(`/admin/compte/${userId}`);
  revalidatePath("/admin");
  return { ok: true };
}

// Débite le portefeuille d'un compte (action admin), refusée si le solde est insuffisant.
export async function debiterCompte(userId: string, montant: number): Promise<AdminCompteState> {
  if (!(await exigerAdmin())) return { error: "Non autorisé." };
  const m = Math.round(montant);
  if (!Number.isFinite(m) || m <= 0) return { error: "Montant invalide." };

  const porte = await db.portefeuille.findUnique({ where: { userId }, select: { id: true, solde: true } });
  if (!porte) return { error: "Portefeuille introuvable." };
  if (porte.solde < m) return { error: "Solde insuffisant." };

  await db.$transaction([
    db.portefeuille.update({ where: { id: porte.id }, data: { solde: { decrement: m } } }),
    db.mouvementPortefeuille.create({
      data: { portefeuilleId: porte.id, type: "BONUS", montant: -m, libelle: "Débit administrateur" },
    }),
  ]);

  revalidatePath(`/admin/compte/${userId}`);
  revalidatePath("/admin");
  return { ok: true };
}
