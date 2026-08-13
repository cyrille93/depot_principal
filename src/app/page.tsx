import { auth } from "@/auth";
import { listerAnnonces, compterAnnonces, ANNONCES_PAR_PAGE } from "@/lib/annonces";
import { db } from "@/lib/db";
import { AccueilUnifie } from "@/components/AccueilUnifie";
import { JsonLd } from "@/components/JsonLd";
import { MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ville?: string; service?: string; compte?: string; q?: string; tier?: string; tri?: string; page?: string }>;
}) {
  const [sp, session] = await Promise.all([searchParams, auth()]);
  const page = Math.max(1, Number(sp.page) || 1);
  const filtres = { villeId: sp.ville, service: sp.service, compte: sp.compte, q: sp.q, tier: sp.tier, tri: sp.tri };

  const [profils, total, villes] = await Promise.all([
    listerAnnonces({ ...filtres, page }, session?.user?.id),
    compterAnnonces(filtres),
    db.ville.findMany({ where: { actif: true }, orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / ANNONCES_PAR_PAGE));

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
        page={page}
        totalPages={totalPages}
        query={{ ville: sp.ville, service: sp.service, compte: sp.compte, q: sp.q, tier: sp.tier, tri: sp.tri }}
      />
    </>
  );
}
