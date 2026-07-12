"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, Plus, Minus, Wallet, CheckCircle2, XCircle } from "lucide-react";
import { crediterCompte, debiterCompte } from "@/app/actions/admin-compte";
import { useToast } from "@/components/Toast";
import { fcfa } from "@/lib/mock";

type Compte = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  role: string;
  statut: string;
  niveauVerification: number;
  solde: number;
  annonces: { id: string; titre: string; statut: string }[];
  mouvements: { id: string; montant: number; libelle: string; date: string }[];
};

export function FicheCompteAdmin({ compte }: { compte: Compte }) {
  const router = useRouter();
  const toast = useToast();
  const [montant, setMontant] = useState("");
  const [busy, setBusy] = useState(false);

  const waLink = compte.telephone ? `https://wa.me/${compte.telephone.replace(/\D/g, "")}` : null;

  const agir = async (sens: "credit" | "debit") => {
    const m = Number(montant);
    if (!Number.isFinite(m) || m <= 0) {
      toast("Montant invalide.", "error");
      return;
    }
    setBusy(true);
    const res = sens === "credit" ? await crediterCompte(compte.id, m) : await debiterCompte(compte.id, m);
    setBusy(false);
    if (res?.error) {
      toast(res.error, "error");
      return;
    }
    toast(sens === "credit" ? "Compte crédité." : "Compte débité.", "success");
    setMontant("");
    router.refresh();
  };

  const info = "rounded-champ border border-bordure bg-carte px-3 py-2 text-sm";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-5">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-action-verte">
        <ChevronLeft className="h-4 w-4" /> Retour à l'admin
      </Link>

      <h1 className="text-xl font-medium text-principal">{compte.nom}</h1>
      <p className="mt-0.5 text-sm text-secondaire">
        {compte.role} · {compte.statut} · vérification niveau {compte.niveauVerification}/3
      </p>

      {/* Coordonnées */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className={info}>
          <span className="block text-[11px] text-tertiaire">E-mail</span>
          {compte.email ?? "—"}
        </div>
        <div className={info}>
          <span className="block text-[11px] text-tertiaire">Téléphone</span>
          {compte.telephone ?? "—"}
        </div>
      </div>

      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert"
        >
          <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
        </a>
      ) : (
        <p className="mt-3 text-center text-[12px] text-tertiaire">Aucun numéro pour contacter par WhatsApp.</p>
      )}

      {/* Portefeuille */}
      <section className="mt-6 rounded-carte border border-bordure bg-carte p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-principal">
            <Wallet className="h-4 w-4 text-action-verte" /> Solde du portefeuille
          </span>
          <span className="text-lg font-medium text-principal">{fcfa(compte.solde)}</span>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
            type="number"
            min={1}
            placeholder="Montant en FCFA"
            className="flex-1 rounded-champ border border-bordure bg-fond-page px-3 py-2.5 text-sm outline-none focus:border-feuille"
          />
          <button
            onClick={() => agir("credit")}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 rounded-champ bg-feuille px-4 py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Créditer
          </button>
          <button
            onClick={() => agir("debit")}
            disabled={busy}
            className="flex items-center justify-center gap-1.5 rounded-champ border border-vip px-4 py-2.5 text-sm font-medium text-vip disabled:opacity-60"
          >
            <Minus className="h-4 w-4" /> Débiter
          </button>
        </div>
      </section>

      {/* Annonces */}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-principal">Annonces ({compte.annonces.length})</h2>
        <div className="mt-2 space-y-2">
          {compte.annonces.length === 0 ? (
            <p className="text-sm text-secondaire">Aucune annonce.</p>
          ) : (
            compte.annonces.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-champ border border-bordure bg-carte px-3 py-2 text-sm">
                <span className="truncate text-principal">{a.titre}</span>
                <span className="ml-2 flex items-center gap-1 text-[12px] text-secondaire">
                  {a.statut === "ACTIVE" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-texte-succes" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-tertiaire" />
                  )}
                  {a.statut}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Derniers mouvements */}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-principal">Derniers mouvements</h2>
        <div className="mt-2 space-y-1.5">
          {compte.mouvements.length === 0 ? (
            <p className="text-sm text-secondaire">Aucun mouvement.</p>
          ) : (
            compte.mouvements.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-champ border border-bordure bg-carte px-3 py-2 text-sm">
                <span className="text-secondaire">
                  <span className="text-[11px] text-tertiaire">{m.date} · </span>
                  {m.libelle}
                </span>
                <span className={m.montant >= 0 ? "font-medium text-texte-succes" : "font-medium text-vip"}>
                  {m.montant >= 0 ? "+" : ""}
                  {fcfa(m.montant)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
