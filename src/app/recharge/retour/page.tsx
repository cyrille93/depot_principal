import Link from "next/link";
import { db } from "@/lib/db";
import { verifierPaiement } from "@/lib/cinetpay";
import { crediterRechargeConfirmee } from "@/lib/recharge";

export const dynamic = "force-dynamic";

export default async function RetourRecharge({
  searchParams,
}: {
  searchParams: Promise<{ tx?: string }>;
}) {
  const { tx } = await searchParams;

  let etat: "ok" | "attente" | "erreur" = "erreur";
  if (tx) {
    const { confirme } = await verifierPaiement(tx);
    if (confirme) {
      // Filet de sécurité si le webhook n'a pas encore crédité
      const recharge = await db.recharge.findFirst({ where: { refOperateur: tx } });
      if (recharge) await crediterRechargeConfirmee(recharge.id);
      etat = "ok";
    } else {
      etat = "attente";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-carte border border-bordure bg-carte p-6 text-center">
        {etat === "ok" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-pill bg-tint-succes text-2xl">✅</div>
            <h1 className="text-lg font-medium text-principal">Recharge confirmée</h1>
            <p className="mt-1 text-sm text-secondaire">Votre portefeuille a été crédité.</p>
          </>
        )}
        {etat === "attente" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-pill bg-surface-neutre text-2xl">⏳</div>
            <h1 className="text-lg font-medium text-principal">Paiement en cours de validation</h1>
            <p className="mt-1 text-sm text-secondaire">Si le paiement aboutit, votre solde sera crédité automatiquement.</p>
          </>
        )}
        {etat === "erreur" && (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-pill bg-surface-neutre text-2xl">⚠️</div>
            <h1 className="text-lg font-medium text-principal">Paiement introuvable</h1>
            <p className="mt-1 text-sm text-secondaire">Aucune transaction valide n'a été trouvée.</p>
          </>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <Link href="/portefeuille" className="rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert">
            Voir mon portefeuille
          </Link>
          <Link href="/recharge" className="rounded-champ border border-bordure py-2.5 text-sm text-principal">
            Recharger à nouveau
          </Link>
        </div>
      </div>
    </main>
  );
}
