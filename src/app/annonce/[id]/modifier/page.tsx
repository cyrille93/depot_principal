import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ModifierAnnonceForm } from "@/components/ModifierAnnonceForm";

export const dynamic = "force-dynamic";

export default async function ModifierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const [annonce, villes] = await Promise.all([
    db.annonce.findUnique({
      where: { id },
      select: {
        id: true,
        titre: true,
        description: true,
        categorie: true,
        prix: true,
        villeId: true,
        userId: true,
        medias: { select: { url: true, floutee: true, visagesFloutes: true, ordre: true }, orderBy: { ordre: "asc" } },
      },
    }),
    db.ville.findMany({ where: { actif: true }, orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
  ]);

  if (!annonce || annonce.userId !== session.user.id) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const medias = (annonce.medias as any[]).map((m) => ({
    src: m.url as string,
    floutes: (m.visagesFloutes as number) ?? 0,
  }));

  return (
    <ModifierAnnonceForm
      annonce={{
        id: annonce.id,
        titre: annonce.titre,
        description: annonce.description,
        categorie: annonce.categorie,
        prix: annonce.prix,
        villeId: annonce.villeId,
      }}
      mediasInit={medias}
      villes={villes}
    />
  );
}
