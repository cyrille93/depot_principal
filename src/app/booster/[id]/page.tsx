import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BoosterForm } from "@/components/BoosterForm";

export const dynamic = "force-dynamic";

export default async function BoosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const annonce = await db.annonce.findUnique({
    where: { id },
    select: { id: true, titre: true, userId: true },
  });
  if (!annonce || annonce.userId !== session.user.id) notFound();

  const porte = await db.portefeuille.findUnique({
    where: { userId: session.user.id },
    select: { solde: true },
  });

  return <BoosterForm annonceId={annonce.id} titre={annonce.titre} solde={porte?.solde ?? 0} />;
}
