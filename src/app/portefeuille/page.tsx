import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPortefeuilleData } from "@/lib/portefeuille";
import { PortefeuilleClient } from "@/components/PortefeuilleClient";

export const dynamic = "force-dynamic";

export default async function PortefeuillePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  const data = await getPortefeuilleData(session.user.id);
  return <PortefeuilleClient data={data} />;
}
