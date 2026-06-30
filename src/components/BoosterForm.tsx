"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Star, TrendingUp, Crown, Wallet, CircleAlert } from "lucide-react";
import { fcfa } from "@/lib/mock";
import { acheterMiseEnAvant } from "@/app/actions/premium";
import { TARIFS_MISE_EN_AVANT } from "@/lib/premium";
import { useToast } from "@/components/Toast";

const NIVEAUX = [
  { v: "URGENT", l: "Urgent", desc: "Badge Urgent + remontée dans la liste", Icon: Clock },
  { v: "TOP", l: "TOP", desc: "Mis en avant en tête des résultats", Icon: TrendingUp },
  { v: "VIP", l: "VIP", desc: "Badge VIP doré, forte visibilité", Icon: Star },
  { v: "PREMIUM", l: "Premium", desc: "Visibilité maximale sur la plateforme", Icon: Crown },
];

export function BoosterForm({
  annonceId,
  titre,
  solde,
  tarifs = TARIFS_MISE_EN_AVANT,
  gratuit = false,
}: {
  annonceId: string;
  titre: string;
  solde: number;
  tarifs?: Record<string, number>;
  gratuit?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [niveau, setNiveau] = useState("VIP");
  const [jours, setJours] = useState(3);
  const [enCours, setEnCours] = useState(false);

  const tarif = tarifs[niveau] ?? 0;
  const total = gratuit ? 0 : tarif * jours;
  const insuffisant = !gratuit && total > solde;

  const confirmer = async () => {
    setEnCours(true);
    const res = await acheterMiseEnAvant(annonceId, niveau, jours);
    setEnCours(false);
    if (res.ok) {
      toast(`Mise en avant ${niveau} activée pour ${jours} jour(s).`, "success");
      router.push("/compte");
    } else {
      toast(res.error ?? "Échec de l'opération.", "error");
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4">
        <Link href="/compte" className="text-sm text-secondaire">← Mon compte</Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Booster ma visibilité</h1>
      <p className="mt-1 truncate text-sm text-secondaire">Annonce : {titre}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-secondaire">
        <Wallet className="h-4 w-4 text-action-verte" /> Solde : <b className="text-principal">{fcfa(solde)}</b>
      </p>

      {gratuit && (
        <div className="mt-3 rounded-carte bg-tint-succes px-4 py-2.5 text-[13px] text-texte-succes">
          🎉 Lancement : toutes les mises en avant sont <b>offertes</b>. Profitez-en pour booster votre annonce gratuitement.
        </div>
      )}

      {/* Niveau */}
      <div className="mt-5 space-y-2">
        {NIVEAUX.map((n) => {
          const on = niveau === n.v;
          return (
            <button
              key={n.v}
              onClick={() => setNiveau(n.v)}
              className={
                "flex w-full items-center gap-3 rounded-carte border p-3 text-left " +
                (on ? "border-feuille bg-tint-succes" : "border-bordure bg-carte")
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-carte text-texte-succes">
                <n.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-principal">{n.l}</span>
                <span className="block text-xs text-secondaire">{n.desc}</span>
              </span>
              <span className="shrink-0 text-sm font-medium text-principal">
                {gratuit ? "Offert" : `${fcfa(tarifs[n.v] ?? 0)}/j`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Durée */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-principal">Durée</span>
          <span className="font-medium text-principal">{jours} jour{jours > 1 ? "s" : ""}</span>
        </div>
        <input
          type="range"
          min={1}
          max={5}
          value={jours}
          onChange={(e) => setJours(Number(e.target.value))}
          className="w-full accent-feuille"
        />
        <div className="mt-1 flex justify-between text-[11px] text-tertiaire">
          {[1, 2, 3, 4, 5].map((d) => <span key={d}>{d}</span>)}
        </div>
      </div>

      {/* Total */}
      <div className="mt-5 flex items-center justify-between rounded-carte border border-bordure bg-carte p-4">
        <span className="text-sm text-secondaire">Total</span>
        <span className="text-lg font-medium text-principal">{gratuit ? "Offert (lancement)" : fcfa(total)}</span>
      </div>

      {insuffisant ? (
        <>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-vip">
            <CircleAlert className="h-4 w-4" /> Solde insuffisant.
          </p>
          <p className="mt-2 text-center text-[12px] text-secondaire">
            Le rechargement en ligne est momentanément indisponible.
          </p>
        </>
      ) : (
        <button
          onClick={confirmer}
          disabled={enCours}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          <Wallet className="h-4 w-4" /> {enCours ? "Activation…" : gratuit ? "Activer gratuitement" : `Payer ${fcfa(total)}`}
        </button>
      )}

      <p className="mt-3 text-center text-[11px] text-tertiaire">
        La mise en avant expire automatiquement après la durée choisie (l'annonce redevient standard).
      </p>
    </main>
  );
}
