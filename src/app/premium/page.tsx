"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  TrendingUp,
  Megaphone,
  Crown,
  Images,
  Wallet,
  Check,
  CircleAlert,
} from "lucide-react";
import { PORTEFEUILLE as P, fcfa } from "@/lib/mock";

type Offre = {
  id: string;
  nom: string;
  desc: string;
  prix: number;
  duree: number;
  icon: typeof Crown;
};

const OFFRES: Offre[] = [
  { id: "avant", nom: "Mise en avant", desc: "Votre annonce passe en tête des résultats de votre ville.", prix: 3000, duree: 7, icon: TrendingUp },
  { id: "sponso", nom: "Annonce sponsorisée", desc: "Position privilégiée et libellé « Sponsorisé » sur tout le Cameroun.", prix: 6000, duree: 7, icon: Megaphone },
  { id: "badge", nom: "Badge Premium", desc: "Met en valeur votre profil avec le badge Premium.", prix: 5000, duree: 30, icon: Crown },
  { id: "galerie", nom: "Galerie étendue", desc: "Ajoutez plus de photos et de vidéos à vos annonces.", prix: 4000, duree: 30, icon: Images },
];

export default function PremiumPage() {
  const [choix, setChoix] = useState<Offre | null>(null);
  const [active, setActive] = useState(false);

  const soldeApres = choix ? P.solde - choix.prix : P.solde;

  // Écran succès
  if (active && choix) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-medium text-principal">{choix.nom} activé</h1>
        <p className="mt-2 text-sm text-secondaire">
          Actif pendant {choix.duree} jours. {fcfa(choix.prix)} débités de votre portefeuille.
        </p>
        <div className="mt-4 w-full rounded-carte border border-bordure bg-carte p-4 text-left">
          <div className="flex items-center justify-between text-sm">
            <span className="text-secondaire">Nouveau solde</span>
            <span className="font-medium text-principal">{fcfa(soldeApres)}</span>
          </div>
        </div>
        <Link href="/explorer" className="mt-6 w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert">
          Voir mon annonce
        </Link>
        <Link href="/portefeuille" className="mt-2 text-sm text-action-verte">
          Retour au portefeuille
        </Link>
      </main>
    );
  }

  // Écran confirmation
  if (choix) {
    const insuffisant = choix.prix > P.solde;
    return (
      <main className="mx-auto max-w-md px-4 py-5">
        <button onClick={() => setChoix(null)} className="mb-4 flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Retour
        </button>
        <h1 className="text-xl font-medium text-principal">Confirmer l'achat</h1>

        <div className="mt-5 rounded-carte border border-bordure bg-carte p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
              <choix.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-medium text-principal">{choix.nom}</div>
              <div className="text-xs text-secondaire">{choix.duree} jours</div>
            </div>
            <span className="ml-auto text-sm font-medium text-principal">{fcfa(choix.prix)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-bordure pt-3 text-sm">
            <span className="text-secondaire">Solde après</span>
            <span className="font-medium text-principal">{fcfa(soldeApres)}</span>
          </div>
        </div>

        {insuffisant ? (
          <>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-vip">
              <CircleAlert className="h-4 w-4" /> Solde insuffisant.
            </p>
            <Link href="/recharge" className="mt-3 block w-full rounded-champ bg-feuille py-3 text-center text-sm font-medium text-sur-vert">
              Recharger mon portefeuille
            </Link>
          </>
        ) : (
          <button
            onClick={() => setActive(true)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert"
          >
            <Wallet className="h-4 w-4" /> Payer avec mon portefeuille
          </button>
        )}
      </main>
    );
  }

  // Liste des offres
  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4 flex items-center gap-1">
        <Link href="/portefeuille" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Portefeuille
        </Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Booster ma visibilité</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-secondaire">
        <Wallet className="h-4 w-4 text-action-verte" />
        Solde : <b className="text-principal">{fcfa(P.solde)}</b>
      </p>

      <div className="mt-5 space-y-3">
        {OFFRES.map((o) => {
          const peut = o.prix <= P.solde;
          return (
            <div key={o.id} className="rounded-carte border border-bordure bg-carte p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
                  <o.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-principal">{o.nom}</span>
                    <span className="shrink-0 text-sm font-medium text-principal">{fcfa(o.prix)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-secondaire">{o.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-tertiaire">{o.duree} jours</span>
                    <button
                      onClick={() => setChoix(o)}
                      className={
                        "rounded-champ px-4 py-1.5 text-xs font-medium " +
                        (peut
                          ? "bg-feuille text-sur-vert"
                          : "border border-bordure text-tertiaire")
                      }
                    >
                      {peut ? "Choisir" : "Solde insuffisant"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-tertiaire">
        Réglé avec le solde du portefeuille — données fictives.
      </p>
    </main>
  );
}
