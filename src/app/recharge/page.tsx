"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Smartphone,
  ShieldCheck,
  Check,
  Loader2,
  Gift,
} from "lucide-react";
import { fcfa } from "@/lib/mock";
import { rechargerPortefeuille } from "@/app/actions/portefeuille";

const OPERATEURS = [
  { id: "orange", nom: "Orange Money", couleur: "#FF7900", surCouleur: "#FFFFFF", initiales: "OM" },
  { id: "mtn", nom: "MTN MoMo", couleur: "#FFCC00", surCouleur: "#1A1A1A", initiales: "MTN" },
] as const;

const PRESETS = [5000, 10000, 25000, 50000];
const TAUX_COMMISSION = 5;

type Etape = "form" | "pending" | "success";

export default function RechargePage() {
  const [etape, setEtape] = useState<Etape>("form");
  const [operateur, setOperateur] = useState<string | null>(null);
  const [montant, setMontant] = useState<number>(10000);
  const [tel, setTel] = useState("+237 6");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const op = OPERATEURS.find((o) => o.id === operateur) ?? null;
  const valide = !!op && montant > 0 && tel.trim().length >= 8;

  const confirmer = async () => {
    setErreur(null);
    setEnCours(true);
    const opEnum = operateur === "orange" ? "ORANGE_MONEY" : "MTN_MOMO";
    const res = await rechargerPortefeuille(montant, opEnum);
    setEnCours(false);
    if (res.ok) setEtape("success");
    else setErreur(res.error ?? "Échec de la recharge.");
  };

  if (etape === "pending") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-feuille" />
        <h1 className="mt-4 text-xl font-medium text-principal">Demande envoyée</h1>
        <p className="mt-2 text-sm text-secondaire">
          Une demande de paiement de <b>{fcfa(montant)}</b> a été envoyée au{" "}
          {op?.nom} sur le {tel}. Validez-la avec votre code Mobile Money.
        </p>
        <button
          onClick={confirmer}
          disabled={enCours}
          className="mt-6 w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          {enCours ? "Validation…" : "J'ai validé sur mon téléphone"}
        </button>
        {erreur && <p className="mt-3 text-sm text-vip" role="alert">{erreur}</p>}
        <button
          onClick={() => setEtape("form")}
          className="mt-2 w-full rounded-champ border border-bordure py-2.5 text-sm text-principal"
        >
          Annuler
        </button>
      </main>
    );
  }

  if (etape === "success") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-medium text-principal">Recharge réussie</h1>
        <p className="mt-2 text-sm text-secondaire">
          <b>{fcfa(montant)}</b> ont été crédités sur votre portefeuille.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-carte bg-tint-succes px-4 py-2.5 text-left">
          <Gift className="h-[18px] w-[18px] shrink-0 text-texte-succes" />
          <span className="text-xs text-texte-succes">
            Si vous avez un parrain actif, une commission virtuelle de {TAUX_COMMISSION}% (offerte par la
            plateforme) lui a été créditée — sans rien retirer de votre recharge.
          </span>
        </div>
        <Link
          href="/portefeuille"
          className="mt-6 w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert"
        >
          Retour au portefeuille
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4 flex items-center gap-1">
        <Link href="/portefeuille" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Portefeuille
        </Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Recharger</h1>

      {/* Opérateur */}
      <span className="mb-2 mt-5 block text-sm text-principal">Opérateur</span>
      <div className="grid grid-cols-2 gap-3">
        {OPERATEURS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOperateur(o.id)}
            className={
              "flex items-center gap-2.5 rounded-carte border bg-carte p-3 text-left " +
              (operateur === o.id ? "border-feuille ring-1 ring-feuille" : "border-bordure")
            }
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-pill text-[11px] font-medium"
              style={{ background: o.couleur, color: o.surCouleur }}
            >
              {o.initiales}
            </span>
            <span className="text-sm font-medium text-principal">{o.nom}</span>
          </button>
        ))}
      </div>

      {/* Montant */}
      <span className="mb-2 mt-5 block text-sm text-principal">Montant (FCFA)</span>
      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((m) => (
          <button
            key={m}
            onClick={() => setMontant(m)}
            className={
              "rounded-champ border py-2 text-xs font-medium " +
              (montant === m
                ? "border-feuille bg-tint-succes text-texte-succes"
                : "border-bordure bg-carte text-principal")
            }
          >
            {m.toLocaleString("fr-FR")}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={montant}
        onChange={(e) => setMontant(Number(e.target.value))}
        className="mt-2 w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm outline-none focus:border-feuille"
        placeholder="Autre montant"
      />

      {/* Téléphone */}
      <span className="mb-2 mt-5 block text-sm text-principal">Numéro Mobile Money</span>
      <div className="flex items-center gap-2 rounded-champ border border-bordure bg-carte px-3 py-2.5">
        <Smartphone className="h-[18px] w-[18px] text-tertiaire" />
        <input
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          placeholder="+237 6 XX XX XX XX"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-carte bg-tint-succes-2 px-4 py-2.5">
        <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-action-verte" />
        <span className="text-xs text-texte-succes">
          Paiement sécurisé · cette recharge vous garde actif ce mois (commissions versées).
        </span>
      </div>

      <button
        disabled={!valide}
        onClick={() => setEtape("pending")}
        className="mt-5 w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert disabled:opacity-50"
      >
        Recharger {montant > 0 ? fcfa(montant) : ""}
      </button>
    </main>
  );
}
