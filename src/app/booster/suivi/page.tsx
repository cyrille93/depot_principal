import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SuiviBoosts, type BoostSuivi } from "@/components/SuiviBoosts";

export const dynamic = "force-dynamic";

export default async function SuiviPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const annonces = await db.annonce.findMany({
    where: { userId: session.user.id, miseEnAvant: { not: "STANDARD" }, boostExpire: { gt: new Date() } },
    select: { id: true, titre: true, miseEnAvant: true, boostDebut: true, boostExpire: true },
    orderBy: { boostExpire: "asc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boosts: BoostSuivi[] = (annonces as any[]).map((a) => {
    const fin = a.boostExpire as Date;
    // Pour les anciens boosts sans début enregistré, on estime un début 5 jours avant la fin
    const debut = (a.boostDebut as Date | null) ?? new Date(fin.getTime() - 5 * 86400000);
    return {
      id: a.id,
      titre: a.titre,
      tier: a.miseEnAvant,
      debut: debut.toISOString(),
      fin: fin.toISOString(),
    };
  });

  return <SuiviBoosts boosts={boosts} />;
}
