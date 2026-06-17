import { auth } from "@/auth";
import { listerAnnonces } from "@/lib/annonces";
import { db } from "@/lib/db";
import { getParrainageConfig } from "@/lib/parametres";
import { AccueilUnifie } from "@/components/AccueilUnifie";
import { JsonLd } from "@/components/JsonLd";
import { MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ville?: string; service?: string; compte?: string; q?: string; tier?: string; tri?: string }>;
}) {
  const [sp, session] = await Promise.all([searchParams, auth()]);

  const [profils, villes, config] = await Promise.all([
    listerAnnonces(
      { villeId: sp.ville, service: sp.service, compte: sp.compte, q: sp.q, tier: sp.tier, tri: sp.tri },
      session?.user?.id,
    ),
    db.ville.findMany({ where: { actif: true }, orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
    getParrainageConfig(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: MARQUE_SEO,
          url: SITE_URL,
          logo: `${SITE_URL}/logo-rose-annonce.png`,
          areaServed: "CM",
        }}
      />
      <AccueilUnifie
        profils={profils}
        tri={sp.tri ?? ""}
        villes={villes}
        serviceActif={sp.service ?? ""}
        villeActive={sp.ville ?? ""}
        q={sp.q ?? ""}
        taux={config.taux}
        dureeMois={config.dureeMois}
      />
    </>
  );
}
