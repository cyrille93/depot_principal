"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Send,
  Users,
  Gift,
  Clock,
  Copy,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Crown,
  CircleAlert,
} from "lucide-react";
import { fcfa } from "@/lib/mock";
import type { PortefeuilleData, MouvementVue } from "@/lib/portefeuille";

function iconeMouvement(type: MouvementVue["type"]) {
  switch (type) {
    case "recharge": return ArrowDownLeft;
    case "commission": return Gift;
    case "bonus": return Sparkles;
    case "premium": return Crown;
    case "transfert_in": return ArrowDownLeft;
    case "transfert_out": return ArrowUpRight;
  }
}

function Copier({ valeur, label }: { valeur: string; label: string }) {
  const [copie, setCopie] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(valeur);
          setCopie(true);
          setTimeout(() => setCopie(false), 1500);
        } catch {}
      }}
      className="flex items-center gap-1 text-xs font-medium text-action-verte"
      aria-label={`Copier ${label}`}
    >
      {copie ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copie ? "Copié" : "Copier"}
    </button>
  );
}

function Stat({ icon: Icon, valeur, label }: { icon: typeof Users; valeur: string; label: string }) {
  return (
    <div className="rounded-carte border border-bordure bg-carte p-3">
      <Icon className="h-5 w-5 text-action-verte" strokeWidth={1.75} />
      <div className="mt-1.5 text-base font-medium text-principal">{valeur}</div>
      <div className="text-[11px] text-secondaire">{label}</div>
    </div>
  );
}

export function PortefeuilleClient({ data: P }: { data: PortefeuilleData }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-5">
      <div className="mb-4 flex items-center gap-1">
        <Link href="/compte" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Mon compte
        </Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Portefeuille &amp; parrainage</h1>

      {/* Solde */}
      <section className="mt-4 rounded-carte bg-foret p-5">
        <span className="text-sm text-sur-foret-mute">Solde disponible</span>
        <div className="mt-1 text-3xl font-medium text-sur-foret">{fcfa(P.solde)}</div>
        <div className="mt-4 flex gap-2">
          <Link href="/transfert" className="flex flex-1 items-center justify-center gap-2 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert">
            <Send className="h-4 w-4" /> Transférer
          </Link>
        </div>
      </section>

      {/* Parrainage réservé aux annonceurs */}
      {P.estPro ? (
        <>
          {P.actifCeMois ? (
            <div className="mt-3 flex items-center gap-2 rounded-carte bg-tint-succes px-4 py-2.5">
              <Check className="h-[18px] w-[18px] text-texte-succes" />
              <span className="text-xs text-texte-succes">
                Vous êtes actif ce mois — vos commissions de parrainage sont versées.
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-carte bg-vip/10 px-4 py-2.5">
              <CircleAlert className="h-[18px] w-[18px] text-vip" />
              <span className="text-xs text-vip">
                Rechargez ce mois pour percevoir vos commissions — sinon elles sont perdues.
              </span>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Users} valeur={`${P.filleulsInscrits}`} label="Filleuls inscrits" />
            <Stat icon={Users} valeur={`${P.filleulsActifs}`} label="Filleuls actifs" />
            <Stat icon={Gift} valeur={fcfa(P.gainsGeneres)} label="Gains générés" />
            <Stat icon={Clock} valeur={fcfa(P.commissionsEnAttente)} label="En attente" />
          </div>

          <section className="mt-3 rounded-carte border border-bordure bg-carte p-4">
            <h2 className="text-base font-medium text-principal">Votre parrainage</h2>
            <p className="mt-1 text-sm text-secondaire">
              Gagnez {P.tauxCommission}% (bonus plateforme) sur chaque recharge de vos filleuls pendant {P.dureeMois} mois.
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-champ bg-page px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-[11px] text-secondaire">Code</div>
                  <div className="truncate text-sm font-medium text-principal">{P.code}</div>
                </div>
                <Copier valeur={P.code} label="le code" />
              </div>
              <div className="flex items-center justify-between rounded-champ bg-page px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-[11px] text-secondaire">Lien d'invitation</div>
                  <div className="truncate text-sm text-principal">{P.lien}</div>
                </div>
                <Copier valeur={P.lien} label="le lien" />
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="mt-3 flex items-center gap-2 rounded-carte bg-surface-neutre px-4 py-2.5">
          <Gift className="h-[18px] w-[18px] text-secondaire" />
          <span className="text-xs text-secondaire">
            Le parrainage est réservé aux comptes annonceurs.
          </span>
        </div>
      )}

      {/* Booster visibilité */}
      <Link href="/premium" className="mt-3 flex items-center gap-3 rounded-carte border border-bordure bg-carte p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
          <Crown className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-principal">Booster ma visibilité</div>
          <div className="text-xs text-secondaire">Dépensez votre solde en mise en avant, badge, galerie…</div>
        </div>
        <span className="text-action-verte">→</span>
      </Link>

      {/* Historique */}
      <section className="mt-3 rounded-carte border border-bordure bg-carte p-4">
        <h2 className="text-base font-medium text-principal">Mouvements</h2>
        {P.mouvements.length === 0 ? (
          <p className="py-6 text-center text-sm text-tertiaire">
            Aucun mouvement pour l'instant. Rechargez pour commencer.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-bordure">
            {P.mouvements.map((m) => {
              const Icon = iconeMouvement(m.type);
              const credit = m.montant > 0;
              return (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-pill " + (credit ? "bg-tint-succes text-texte-succes" : "bg-pill-fond text-pill-texte")}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-principal">{m.label}</div>
                    <div className="text-[11px] text-tertiaire">{m.date}</div>
                  </div>
                  <span className={"shrink-0 text-sm font-medium " + (credit ? "text-texte-succes" : "text-principal")}>
                    {credit ? "+" : "−"} {fcfa(Math.abs(m.montant))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
