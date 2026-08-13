import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { BoosterForm } from "@/components/BoosterForm";
import { getTarifsMiseEnAvant, forfaitsGratuits, getWhatsappSupport } from "@/lib/parametres";

export const dynamic = "force-dynamic";

export default async function BoosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const annonce = await db.annonce.findUnique({
    where: { id },
    select: { id: true, titre: true, userId: true },
  });
  if (!annonce || annonce.userId !== session.user.id) notFound();

  const [tarifs, gratuit, whatsapp, user] = await Promise.all([
    getTarifsMiseEnAvant(),
    forfaitsGratuits(),
    getWhatsappSupport(),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, telephone: true, profil: { select: { pseudo: true } } },
    }),
  ]);

  const pseudo = user?.profil?.pseudo ?? session.user.email?.split("@")[0] ?? "Annonceur";
  const contact = user?.email ?? user?.telephone ?? "sans contact";
  const identite = `${pseudo} (${contact})`;

  return (
    <BoosterForm
      annonceId={annonce.id}
      titre={annonce.titre}
      tarifs={tarifs}
      gratuit={gratuit}
      whatsapp={whatsapp}
      identite={identite}
    />
  );
}
