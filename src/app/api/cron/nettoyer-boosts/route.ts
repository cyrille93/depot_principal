import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Tâche planifiée (Vercel Cron) : repasse en "normal" toutes les annonces dont
// la mise en avant (Premium / TOP / VIP / Urgent) est expirée. Cela garde la
// base cohérente pour le tri, la pagination et le back-office admin.
export async function GET(request: Request) {
  // Sécurité : si CRON_SECRET est défini, Vercel Cron envoie l'en-tête
  // "Authorization: Bearer <CRON_SECRET>". On refuse tout appel non signé.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
  }

  const res = await db.annonce.updateMany({
    where: { estBoostee: true, boostExpire: { lt: new Date() } },
    data: { estBoostee: false, miseEnAvant: "STANDARD", boostMontant: 0 },
  });

  return NextResponse.json({ ok: true, remisesANormal: res.count });
}
