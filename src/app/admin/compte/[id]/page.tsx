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
    annonces: user.annonces,
  };

  return <FicheCompteAdmin compte={compte} />;
}
