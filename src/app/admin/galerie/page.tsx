import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { GalerieAdminClient } from "@/components/GalerieAdminClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "ADMIN") redirect("/");

  const videos = await db.videoGalerie.findMany({
    orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
    select: { id: true, titre: true, description: true, url: true },
  });

  return <GalerieAdminClient videos={videos} />;
}
