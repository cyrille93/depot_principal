import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { listerAnnonces } from "@/lib/annonces";
import { ProfilCard } from "@/components/ProfilCard";
import { JsonLd } from "@/components/JsonLd";
import { categorieParSlug, MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = { categorie: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { categorie } = await params;
  const c = categorieParSlug(categorie);
  if (!c) return { title: `Annonces — ${MARQUE_SEO}` };
  const titre = `${c.titre} au Cameroun — ${MARQUE_SEO}`;
  const description = `Toutes les annonces ${c.titre.toLowerCase()} au Cameroun sur ${MARQUE_SEO} : Douala, Yaoundé et toutes les villes. Profils vérifiés, avis réels, messagerie sécurisée.`;
  const url = `${SITE_URL}/annonces/categorie/${c.slug}`;
  return {
    title: titre,
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: MARQUE_SEO, type: "website", locale: "fr_FR" },
    twitter: { card: "summary", title: titre, description },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { categorie } = await params;
  const c = categorieParSlug(categorie);
  if (!c) notFound();

  const [annonces, villes] = await Promise.all([
    listerAnnonces({ service: c.enum }),
    db.ville.findMany({ where: { actif: true }, orderBy: { nom: "asc" }, take: 16, select: { nom: true, slug: true } }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Annonces", item: `${SITE_URL}/annonces` },
          { "@type": "ListItem", position: 3, name: `${c.titre} au Cameroun`, item: `${SITE_URL}/annonces/categorie/${c.slug}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `${c.titre} au Cameroun`,
        numberOfItems: annonces.length,
        itemListElement: annonces.slice(0, 20).map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/profil/${a.id}`,
          name: a.pseudo,
        })),
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <JsonLd data={jsonLd} />
      <header className="flex items-center justify-between border-b border-bordure bg-carte px-4 py-3 md:px-10">
        <Link href="/" className="text-lg font-medium text-principal">{MARQUE_SEO}</Link>
        <Link href="/explorer" className="rounded-champ bg-feuille px-4 py-2 text-sm font-medium text-sur-vert">
          Explorer
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <nav className="mb-3 text-xs text-secondaire">
          <Link href="/annonces" className="text-action-verte">Annonces</Link>
          <span> / {c.titre}</span>
        </nav>

        <h1 className="text-2xl font-medium text-principal md:text-3xl">{c.titre} au Cameroun</h1>
        <p className="mt-2 max-w-2xl text-sm text-secondaire">{c.intro.replace("{ville}", "votre ville")}</p>
        <p className="mt-2 text-sm text-texte-succes">
          <b>{annonces.length}</b> annonce{annonces.length > 1 ? "s" : ""} {c.titre.toLowerCase()} au Cameroun.
        </p>

        {annonces.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {annonces.map((a) => (
              <ProfilCard key={a.id} profil={a} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-carte border border-bordure bg-carte p-8 text-center text-sm text-secondaire">
            Aucune annonce pour le moment dans cette catégorie.{" "}
            <Link href="/publier" className="font-medium text-action-verte">Publier la première →</Link>
          </div>
        )}

        {/* Maillage interne : cette catégorie par ville */}
        <section className="mt-10">
          <h2 className="text-base font-medium text-principal">{c.titre} par ville</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {villes.map((v: { nom: string; slug: string }) => (
              <Link
                key={v.slug}
                href={`/annonces/${v.slug}/${c.slug}`}
                className="rounded-pill border border-bordure bg-carte px-3 py-1.5 text-sm text-principal"
              >
                {c.titre} à {v.nom}
              </Link>
            ))}
          </div>
          <Link href="/annonces" className="mt-3 inline-block text-sm font-medium text-action-verte">
            Voir toutes les villes →
          </Link>
        </section>
      </div>

      <footer className="mt-10 border-t border-bordure px-5 py-8 text-center text-sm text-secondaire">
        {MARQUE_SEO} — Cameroun · 18+ · profils vérifiés
      </footer>
    </main>
  );
}
