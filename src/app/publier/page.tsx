import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PublierForm } from "@/components/PublierForm";

export const dynamic = "force-dynamic";

export default async function PublierPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const villes = await db.ville.findMany({
    where: { actif: true },
    orderBy: { nom: "asc" },
    select: { id: true, nom: true },
  });

  return <PublierForm villes={villes} />;
}
