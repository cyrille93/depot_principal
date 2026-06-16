import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { listerAnnonces } from "@/lib/annonces";
import { ProfilCard } from "@/components/ProfilCard";
import { JsonLd } from "@/components/JsonLd";
import { CATEGORIES_SEO, categorieParSlug, MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = { ville: string; categorie: string };

async function resoudre(params: Params) {
  const v = await db.ville.findFirst({
    where: { slug: params.ville, actif: true },
    select: { id: true, nom: true, slug: true },
  });
  const c = categorieParSlug(params.categorie);
  return { v, c };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params;
  const { v, c } = await resoudre(p);
  if (!v || !c) return { title: `Annonces — ${MARQUE_SEO}` };
  const titre = `${c.titre} à ${v.nom} — ${MARQUE_SEO}`;
  const description = `${c.titre} à ${v.nom} sur ${MARQUE_SEO} : profils vérifiés, avis réels après prestation et messagerie sécurisée. Parcourez les annonces disponibles.`;
  const url = `${SITE_URL}/annonces/${v.slug}/${c.slug}`;
  return {
    title: titre,
    description,
    alternates: { canonical: url },
    openGraph: { title: titre, description, url, siteName: MARQUE_SEO, type: "website", locale: "fr_FR" },
    twitter: { card: "summary", title: titre, description },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { v, c } = await resoudre(p);
  if (!v || !c) notFound();

  const [annonces, autresVilles] = await Promise.all([
    listerAnnonces({ villeId: v.id, service: c.enum }),
    db.ville.findMany({
      where: { actif: true, slug: { not: v.slug } },
      orderBy: { nom: "asc" },
      take: 12,
      select: { nom: true, slug: true },
    }),
  ]);

  const intro = c.intro.replace("{ville}", v.nom);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Annonces", item: `${SITE_URL}/annonces` },
          {
            "@type": "ListItem",
            position: 3,
            name: `${c.titre} à ${v.nom}`,
            item: `${SITE_URL}/annonces/${v.slug}/${c.slug}`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `${c.titre} à ${v.nom}`,
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
      {/* Navigation simple */}
      <header className="flex items-center justify-between border-b border-bordure bg-carte px-4 py-3 md:px-10">
        <Link href="/" className="text-lg font-medium text-principal">{MARQUE_SEO}</Link>
        <Link href="/explorer" className="rounded-champ bg-feuille px-4 py-2 text-sm font-medium text-sur-vert">
          Explorer
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Fil d'Ariane */}
        <nav className="mb-3 text-xs text-secondaire">
          <Link href="/annonces" className="text-action-verte">Annonces</Link>
          <span> / {v.nom} / {c.titre}</span>
        </nav>

        <h1 className="text-2xl font-medium text-principal md:text-3xl">
          {c.titre} à {v.nom}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-secondaire">{intro}</p>
        <p className="mt-2 text-sm text-texte-succes">
          <b>{annonces.length}</b> annonce{annonces.length > 1 ? "s" : ""} {c.titre.toLowerCase()} à {v.nom}.
        </p>

        {/* Annonces */}
        {annonces.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {annonces.map((a) => (
              <ProfilCard key={a.id} profil={a} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-carte border border-bordure bg-carte p-8 text-center text-sm text-secondaire">
            Aucune annonce pour le moment dans cette catégorie à {v.nom}.{" "}
            <Link href="/publier" className="font-medium text-action-verte">Publier la première →</Link>
          </div>
        )}

        {/* Maillage interne : autres catégories dans la même ville */}
        <section className="mt-10">
          <h2 className="text-base font-medium text-principal">Autres catégories à {v.nom}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES_SEO.filter((x) => x.enum !== c.enum).map((x) => (
              <Link
                key={x.slug}
                href={`/annonces/${v.slug}/${x.slug}`}
                className="rounded-pill border border-bordure bg-carte px-3 py-1.5 text-sm text-principal"
              >
                {x.titre} à {v.nom}
              </Link>
            ))}
          </div>
        </section>

        {/* Maillage interne : même catégorie dans d'autres villes */}
        <section className="mt-6">
          <h2 className="text-base font-medium text-principal">{c.titre} dans d'autres villes</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {autresVilles.map((ov: { nom: string; slug: string }) => (
              <Link
                key={ov.slug}
                href={`/annonces/${ov.slug}/${c.slug}`}
                className="rounded-pill border border-bordure bg-carte px-3 py-1.5 text-sm text-principal"
              >
                {c.titre} à {ov.nom}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t border-bordure px-5 py-8 text-center text-sm text-secondaire">
        {MARQUE_SEO} — Cameroun · 18+ · profils vérifiés ·{" "}
        <Link href="/annonces" className="text-action-verte">Toutes les annonces</Link>
      </footer>
    </main>
  );
}
