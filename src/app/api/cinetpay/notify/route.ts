import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifierPaiement } from "@/lib/cinetpay";
import { crediterRechargeConfirmee } from "@/lib/recharge";

// CinetPay appelle cette URL après un paiement (notify_url).
// On NE fait JAMAIS confiance au contenu reçu : on revérifie l'état auprès de CinetPay.
export async function POST(req: NextRequest) {
  let transactionId = "";
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const j = await req.json();
      transactionId = String(j?.cpm_trans_id ?? j?.transaction_id ?? "");
    } else {
      const form = await req.formData();
      transactionId = String(form.get("cpm_trans_id") ?? form.get("transaction_id") ?? "");
    }
  } catch {
    /* corps illisible */
  }

  if (!transactionId) return NextResponse.json({ ok: false }, { status: 200 });

  const { confirme } = await verifierPaiement(transactionId);
  if (confirme) {
    const recharge = await db.recharge.findFirst({ where: { refOperateur: transactionId } });
    if (recharge) await crediterRechargeConfirmee(recharge.id);
  }

  // On répond toujours 200 pour que CinetPay n'empile pas les relances
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
