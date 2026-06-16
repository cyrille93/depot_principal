import type { Metadata } from "next";
import { PageLegale, RenduContenu } from "@/components/PageLegale";
import { getContenuPage } from "@/lib/contenus";
import { MARQUE_SEO } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContenuPage("cgu");
  return { title: `${c.titre} — ${MARQUE_SEO}`, description: `${c.titre} de ${MARQUE_SEO}.` };
}

export default async function Page() {
  const c = await getContenuPage("cgu");
  return (
    <PageLegale titre={c.titre}>
      <RenduContenu corps={c.corps} />
    </PageLegale>
  );
}
