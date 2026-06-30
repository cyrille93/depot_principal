import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CATEGORIES_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Villes actives : on garde une correspondance id -> slug pour traduire
  // les résultats de la base en URL.
  const villes = await db.ville.findMany({
    where: { actif: true },
    select: { id: true, slug: true },
  });
  const slugParVilleId = new Map<string, string>(villes.map((v: { id: string; slug: string }) => [v.id, v.slug]));

  // Catégorie (valeur enum en base) -> slug utilisé dans l'URL.
  const slugParCategorie = new Map<string, string>(CATEGORIES_SEO.map((c) => [c.enum as string, c.slug]));

  // Combinaisons (ville, catégorie) ayant AU MOINS une annonce active.
  // groupBy ne renvoie que les groupes qui existent : avec le filtre statut=ACTIVE,
  // chaque groupe retourné a donc forcément >= 1 annonce active.
  const combosActifs = await db.annonce.groupBy({
    by: ["villeId", "categorie"],
    where: { statut: "ACTIVE" },
  });

  const pagesVilleCategorie: MetadataRoute.Sitemap = [];
  const categoriesAvecContenu = new Set<string>();

  for (const combo of combosActifs) {
    const villeSlug = slugParVilleId.get(combo.villeId);
    const catSlug = slugParCategorie.get(combo.categorie as string);
    // Ville inactive ou catégorie inconnue -> on n'expose pas la page.
    if (!villeSlug || !catSlug) continue;
    categoriesAvecContenu.add(catSlug);
    pagesVilleCategorie.push({
      url: `${SITE_URL}/annonces/${villeSlug}/${catSlug}`,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Pages catégorie globales : uniquement celles qui ont du contenu quelque part.
  const pagesCategorie: MetadataRoute.Sitemap = CATEGORIES_SEO
    .filter((c) => categoriesAvecContenu.has(c.slug))
    .map((c) => ({
      url: `${SITE_URL}/annonces/categorie/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  // Pages vitrine, toujours présentes même si le site est encore peu rempli.
  const statiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/annonces`, changeFrequency: "daily", priority: 0.9 },
  ];

  return [...statiques, ...pagesCategorie, ...pagesVilleCategorie];
}
