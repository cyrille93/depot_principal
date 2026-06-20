// Intégration CinetPay. Les identifiants sont lus depuis les variables d'environnement
// (CINETPAY_API_KEY, CINETPAY_SITE_ID) — ils ne sont jamais écrits en dur dans le code.

const BASE = "https://api-checkout.cinetpay.com/v2";

export type CinetPayInit = { ok: boolean; url?: string; error?: string };

export async function creerPaiement(params: {
  transactionId: string;
  montant: number;
  description: string;
  notifyUrl: string;
  returnUrl: string;
  customerName?: string;
  customerPhone?: string;
}): Promise<CinetPayInit> {
  const apikey = process.env.CINETPAY_API_KEY;
  const site_id = process.env.CINETPAY_SITE_ID;
  if (!apikey || !site_id) return { ok: false, error: "Configuration CinetPay manquante (clés)." };

  const body = {
    apikey,
    site_id,
    transaction_id: params.transactionId,
    amount: params.montant,
    currency: "XAF",
    description: params.description,
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    channels: "ALL",
    lang: "fr",
    customer_name: params.customerName ?? "Client",
    customer_phone_number: params.customerPhone ?? "",
  };

  try {
    const res = await fetch(`${BASE}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data?.code === "201" && data?.data?.payment_url) {
      return { ok: true, url: data.data.payment_url as string };
    }
    return { ok: false, error: data?.description ?? data?.message ?? "Échec de l'initialisation du paiement." };
  } catch {
    return { ok: false, error: "Impossible de joindre CinetPay." };
  }
}

// Vérifie l'état réel d'une transaction auprès de CinetPay
export async function verifierPaiement(transactionId: string): Promise<{ confirme: boolean }> {
  const apikey = process.env.CINETPAY_API_KEY;
  const site_id = process.env.CINETPAY_SITE_ID;
  if (!apikey || !site_id) return { confirme: false };

  try {
    const res = await fetch(`${BASE}/payment/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey, site_id, transaction_id: transactionId }),
    });
    const data = await res.json();
    // code "00" + status "ACCEPTED" = paiement réussi
    const confirme = data?.code === "00" && data?.data?.status === "ACCEPTED";
    return { confirme };
  } catch {
    return { confirme: false };
  }
}
