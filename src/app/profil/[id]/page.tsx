import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getAnnonceDetail, getContexteAvis } from "@/lib/annonces";
import { FicheProfil } from "@/components/FicheProfil";
import { JsonLd } from "@/components/JsonLd";
import { MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getAnnonceDetail(id);
  if (!p) return { title: `Annonce — ${MARQUE_SEO}` };
  const titre = `${p.pseudo} — ${p.categorie} à ${p.ville} | ${MARQUE_SEO}`;
  const description = `${p.categorie} à ${p.ville} : ${p.description?.slice(0, 140) ?? ""}`.trim();
  return {
    title: titre,
    description,
    alternates: { canonical: `${SITE_URL}/profil/${id}` },
    openGraph: { title: titre, description, url: `${SITE_URL}/profil/${id}`, siteName: MARQUE_SEO, type: "website", locale: "fr_FR" },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  // +1 vue à chaque ouverture de la fiche
  await db.annonce.update({ where: { id }, data: { nbVues: { increment: 1 } } }).catch(() => {});
  const [profil, ctx] = await Promise.all([
    getAnnonceDetail(id),
    getContexteAvis(id, session?.user?.id),
  ]);
  if (!profil) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: profil.pseudo,
    description: profil.description,
    category: profil.categorie,
    offers: {
      "@type": "Offer",
      price: profil.prix,
      priceCurrency: "XAF",
      availability:
        profil.statut === "Disponible"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };
  if (profil.avis > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: profil.note,
      reviewCount: profil.avis,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <FicheProfil profil={profil} peutEvaluer={ctx.peutEvaluer} monAvis={ctx.monAvis} />
    </>
  );
}
