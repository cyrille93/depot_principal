import { auth } from "@/auth";
import { listerAnnonces } from "@/lib/annonces";
import { ExplorerClient } from "./ExplorerClient";

export const dynamic = "force-dynamic";

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<{ ville?: string; service?: string; compte?: string; q?: string; tier?: string; tri?: string }>;
}) {
  const [sp, session] = await Promise.all([searchParams, auth()]);
  const profils = await listerAnnonces(
    { villeId: sp.ville, service: sp.service, compte: sp.compte, q: sp.q, tier: sp.tier, tri: sp.tri },
    session?.user?.id
  );
  return <ExplorerClient profils={profils} tri={sp.tri ?? ""} />;
}
