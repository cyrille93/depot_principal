import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Enregistre/rafraîchit une visite (statistiques globales, anonymes).
// Le navigateur envoie un identifiant de session éphémère ; on ne stocke
// aucune donnée nominative, juste le début et la dernière activité.
export async function POST(request: Request) {
  let sessionId = "";
  try {
    const body = await request.json();
    sessionId = String(body?.sid ?? "").slice(0, 64);
  } catch {
    /* corps illisible */
  }
  if (!sessionId) return NextResponse.json({ ok: false }, { status: 200 });

  try {
    await db.visiteSession.upsert({
      where: { sessionId },
      create: { sessionId },
      update: { derniereActivite: new Date(), nbEvenements: { increment: 1 } },
    });
  } catch {
    /* on n'échoue jamais côté visiteur pour une statistique */
  }
  return NextResponse.json({ ok: true });
}
