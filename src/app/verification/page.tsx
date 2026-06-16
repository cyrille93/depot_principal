import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getStatutVerification } from "@/lib/verification";
import { VerificationClient } from "@/components/VerificationClient";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const statut = await getStatutVerification(session.user.id);
  return <VerificationClient statut={statut} />;
}
