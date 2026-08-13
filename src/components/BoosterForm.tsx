"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Star, TrendingUp, Crown, MessageCircle, Check } from "lucide-react";
import { fcfa } from "@/lib/mock";
import { acheterMiseEnAvant } from "@/app/actions/premium";
import { TARIFS_MISE_EN_AVANT, FORFAITS_BOOST } from "@/lib/premium";
import { useToast } from "@/components/Toast";

const ICONES: Record<string, typeof Clock> = { URGENT: Clock, TOP: TrendingUp, VIP: Star, PREMIUM: Crown };

export function BoosterForm({
  annonceId,
  titre,
  tarifs = TARIFS_MISE_EN_AVANT,
  gratuit = false,
  whatsapp = null,
  identite = "Annonceur",
}: {
  annonceId: string;
  titre: string;
  tarifs?: Record<string, number>;
  gratuit?: boolean;
  whatsapp?: string | null;
  identite?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [niveau, setNiveau] = useState("VIP");
  const [jours, setJours] = useState(3);
  const [enCours, setEnCours] = useState(false);

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

  const lienWhatsappPour = (niveauLabel: string, montant: number) =>
    whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
          `Bonjour, je suis ${identite}. Je souhaite activer le forfait ${niveauLabel} pendant ${jours} jour${jours > 1 ? "s" : ""} sur mon annonce « ${titre} » (${fcfa(montant)}).`
        )}`
      : null;

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4">
        <Link href="/compte" className="text-sm text-secondaire">← Mon compte</Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Booster ma visibilité</h1>
      <p className="mt-1 truncate text-sm text-secondaire">Annonce : {titre}</p>

      {gratuit && (
        <div className="mt-3 rounded-carte bg-tint-succes px-4 py-2.5 text-[13px] text-texte-succes">
          🎉 Lancement : toutes les mises en avant sont <b>offertes</b>. Profitez-en pour booster votre annonce gratuitement.
        </div>
      )}

      {/* Durée — s'applique à tous les forfaits ci-dessous */}
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

      {/* Forfaits — chaque forfait détaille ce qu'il fait et a sa propre action */}
      <div className="mt-5 space-y-2">
        {FORFAITS_BOOST.map((n) => {
          const on = niveau === n.v;
          const Icon = ICONES[n.v];
          const prixJour = tarifs[n.v] ?? 0;
          const total = prixJour * jours;
          const lienWa = lienWhatsappPour(n.label, total);
          return (
            <div
              key={n.v}
              className={"rounded-carte border p-3 " + (on ? "border-feuille bg-tint-succes" : "border-bordure bg-carte")}
            >
              <button type="button" onClick={() => setNiveau(n.v)} className="flex w-full items-center gap-3 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-carte text-texte-succes">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-principal">{n.label}</span>
                    <span className={`rounded-pill px-1.5 py-0.5 text-[10px] font-medium ${n.badgeClass}`}>{n.label}</span>
                  </span>
                  <span className="block text-xs text-secondaire">{n.accroche}</span>
                </span>
                <span className="shrink-0 text-sm font-medium text-principal">
                  {gratuit ? "Offert" : `${fcfa(prixJour)}/j`}
                </span>
              </button>

              {on && (
                <ul className="mt-3 space-y-1.5 border-t border-bordure pt-3">
                  {n.avantages.map((av) => (
                    <li key={av} className="flex items-start gap-2 text-xs text-secondaire">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action-verte" strokeWidth={2.5} />
                      {av}
                    </li>
                  ))}
                </ul>
              )}

              {gratuit ? (
                on && (
                  <button
                    onClick={confirmer}
                    disabled={enCours}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
                  >
                    {enCours ? "Activation…" : `Activer ${n.label} gratuitement`}
                  </button>
                )
              ) : lienWa ? (
                <a
                  href={lienWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert"
                >
                  <MessageCircle className="h-4 w-4" /> {n.label} — {fcfa(total)} sur WhatsApp
                </a>
              ) : (
                <p className="mt-3 text-center text-[11px] text-tertiaire">Boost payant momentanément indisponible.</p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[11px] text-tertiaire">
        La mise en avant expire automatiquement après la durée choisie (l'annonce redevient standard).
      </p>
    </main>
  );
}
