"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Check, Wallet, CircleAlert, ArrowRight } from "lucide-react";
import { fcfa } from "@/lib/mock";
import { transferer } from "@/app/actions/portefeuille";
import { useToast } from "@/components/Toast";

const MIN = 500;

export function TransfertForm({ solde: soldeInit }: { solde: number }) {
  const router = useRouter();
  const toast = useToast();
  const [solde, setSolde] = useState(soldeInit);
  const [dest, setDest] = useState("");
  const [montant, setMontant] = useState("");
  const [etape, setEtape] = useState<"form" | "success">("form");
  const [recu, setRecu] = useState<{ pseudo: string; montant: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const m = Math.floor(Number(montant) || 0);
  let erreur: string | null = null;
  if (montant && m < MIN) erreur = `Montant minimum : ${fcfa(MIN)}.`;
  else if (m > solde) erreur = "Montant supérieur à votre solde.";
  const valide = dest.trim().length > 0 && m >= MIN && m <= solde;

  const envoyer = async () => {
    if (!valide) return;
    setBusy(true);
    const res = await transferer(dest.trim(), m);
    setBusy(false);
    if (res.ok) {
      setSolde(res.nouveauSolde ?? solde - m);
      setRecu({ pseudo: res.destinataire ?? "le destinataire", montant: m });
      setEtape("success");
    } else {
      toast(res.error ?? "Échec du transfert.", "error");
    }
  };

  if (etape === "success" && recu) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-medium text-principal">Transfert effectué</h1>
        <p className="mt-1 text-sm text-secondaire">
          Vous avez envoyé <b className="text-principal">{fcfa(recu.montant)}</b> à {recu.pseudo}.
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-secondaire">
          <Wallet className="h-4 w-4 text-action-verte" /> Nouveau solde : <b className="text-principal">{fcfa(solde)}</b>
        </p>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => { setEtape("form"); setDest(""); setMontant(""); setRecu(null); }}
            className="rounded-champ border border-bordure px-4 py-2.5 text-sm font-medium text-principal"
          >
            Nouveau transfert
          </button>
          <Link href="/portefeuille" className="rounded-champ bg-feuille px-4 py-2.5 text-sm font-medium text-sur-vert">
            Mon portefeuille
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4">
        <Link href="/portefeuille" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Portefeuille
        </Link>
      </div>

      <h1 className="flex items-center gap-2 text-xl font-medium text-principal">
        <Send className="h-5 w-5 text-action-verte" /> Transférer du solde
      </h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-secondaire">
        <Wallet className="h-4 w-4 text-action-verte" /> Solde disponible : <b className="text-principal">{fcfa(solde)}</b>
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-principal">Destinataire</label>
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value)}
            placeholder="Email ou téléphone du destinataire"
            className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
          />
          <p className="mt-1 text-[11px] text-tertiaire">Le compte doit être actif sur la plateforme.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Montant (FCFA)</label>
          <input
            value={montant}
            onChange={(e) => setMontant(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder={`Minimum ${MIN}`}
            className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
          />
        </div>

        {erreur && (
          <p className="flex items-center gap-1.5 text-sm text-vip">
            <CircleAlert className="h-4 w-4" /> {erreur}
          </p>
        )}

        <button
          onClick={envoyer}
          disabled={!valide || busy}
          className="flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert disabled:opacity-50"
        >
          {busy ? "Transfert…" : <>Transférer {m >= MIN ? fcfa(m) : ""} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </main>
  );
}
