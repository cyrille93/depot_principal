import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORIES_SEO, MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Toutes les annonces au Cameroun — ${MARQUE_SEO}`,
  description: `Petites annonces de rencontres, massages, spa et produits adultes au Cameroun sur ${MARQUE_SEO} : profils vérifiés, avis réels et messagerie sécurisée.`,
  alternates: { canonical: `${SITE_URL}/annonces` },
};

export default async function AnnoncesHub() {
  const villes = await db.ville.findMany({
    where: { actif: true },
    orderBy: { nom: "asc" },
    select: { nom: true, slug: true },
  });

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-bordure bg-carte px-4 py-3 md:px-10">
        <Link href="/" className="text-lg font-medium text-principal">{MARQUE_SEO}</Link>
        <Link href="/explorer" className="rounded-champ bg-feuille px-4 py-2 text-sm font-medium text-sur-vert">
          Explorer
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="text-2xl font-medium text-principal md:text-3xl">Toutes les annonces au Cameroun</h1>
        <p className="mt-2 max-w-2xl text-sm text-secondaire">
          Parcourez les annonces par catégorie et par ville sur {MARQUE_SEO}.
        </p>

        {/* Par catégorie */}
        <section className="mt-6">
          <h2 className="text-base font-medium text-principal">Par catégorie</h2>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORIES_SEO.map((c) => (
              <Link
                key={c.slug}
                href={`/annonces/categorie/${c.slug}`}
                className="rounded-carte border border-bordure bg-carte p-4 text-sm font-medium text-principal"
              >
                {c.titre}
              </Link>
            ))}
          </div>
        </section>

        {/* Par ville */}
        <section className="mt-8">
          <h2 className="text-base font-medium text-principal">Par ville</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {villes.map((v: { nom: string; slug: string }) => (
              <Link
                key={v.slug}
                href={`/annonces/${v.slug}/rencontres`}
                className="rounded-pill border border-bordure bg-carte px-3 py-1.5 text-sm text-principal"
              >
                {v.nom}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-10 border-t border-bordure px-5 py-8 text-center text-sm text-secondaire">
        {MARQUE_SEO} — Cameroun · 18+ · profils vérifiés
      </footer>
    </main>
  );
}
