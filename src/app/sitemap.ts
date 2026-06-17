import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CATEGORIES_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const villes = await db.ville.findMany({ where: { actif: true }, select: { slug: true } });

  const pagesVilleCategorie: MetadataRoute.Sitemap = [];
  for (const v of villes as { slug: string }[]) {
    for (const c of CATEGORIES_SEO) {
      pagesVilleCategorie.push({
        url: `${SITE_URL}/annonces/${v.slug}/${c.slug}`,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  const statiques: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/annonces`, changeFrequency: "daily", priority: 0.9 },
  ];

  const pagesCategorie: MetadataRoute.Sitemap = CATEGORIES_SEO.map((c) => ({
    url: `${SITE_URL}/annonces/categorie/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...statiques, ...pagesCategorie, ...pagesVilleCategorie];
}
