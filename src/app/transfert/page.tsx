import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { TransfertForm } from "@/components/TransfertForm";

export const dynamic = "force-dynamic";

export default async function TransfertPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const porte = await db.portefeuille.findUnique({ where: { userId: session.user.id }, select: { solde: true } });
  return <TransfertForm solde={porte?.solde ?? 0} />;
}
