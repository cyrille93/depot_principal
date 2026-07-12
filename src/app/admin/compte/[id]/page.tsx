import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { FicheCompteAdmin } from "@/components/FicheCompteAdmin";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: {
      profil: true,
      portefeuille: { include: { mouvements: { orderBy: { createdAt: "desc" }, take: 10 } } },
      annonces: { orderBy: { createdAt: "desc" }, select: { id: true, titre: true, statut: true } },
    },
  });
  if (!user) notFound();

  const compte = {
    id: user.id,
    nom: user.profil?.pseudo ?? user.email ?? user.telephone ?? "Compte",
    email: user.email,
    telephone: user.telephone,
    role: user.role,
    statut: user.statut,
    niveauVerification: user.niveauVerification,
    solde: user.portefeuille?.solde ?? 0,
    annonces: user.annonces,
    mouvements: (user.portefeuille?.mouvements ?? []).map((m: { id: string; montant: number; libelle: string; createdAt: Date }) => ({
      id: m.id,
      montant: m.montant,
      libelle: m.libelle,
      date: new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    })),
  };

  return <FicheCompteAdmin compte={compte} />;
}
