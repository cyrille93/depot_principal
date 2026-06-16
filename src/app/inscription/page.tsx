import { db } from "@/lib/db";
import { InscriptionForm } from "@/components/InscriptionForm";

export const dynamic = "force-dynamic";

export default async function InscriptionPage() {
  const villes = await db.ville.findMany({
    where: { actif: true },
    orderBy: { nom: "asc" },
    select: { id: true, nom: true },
  });
  return <InscriptionForm villes={villes} />;
}
