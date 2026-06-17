"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import type { ProfilFictif } from "@/lib/mock";
import { ProfilCard } from "@/components/ProfilCard";
import { NotificationsBell } from "@/components/NotificationsBell";
import { Logo } from "@/components/Logo";

type Ville = { id: string; nom: string };

const CATS = [
  { v: "", label: "Tous", emoji: "" },
  { v: "RENCONTRE", label: "Rencontres", emoji: "❤️" },
  { v: "MASSAGE", label: "Massages", emoji: "✨" },
  { v: "SPA", label: "Spa", emoji: "🌸" },
  { v: "PRODUITS", label: "Produits", emoji: "🛍️" },
];

export function AccueilUnifie({
  profils,
  tri,
  villes,
  serviceActif,
  villeActive,
  q,
  taux,
  dureeMois,
}: {
  profils: ProfilFictif[];
  tri: string;
  villes: Ville[];
  serviceActif: string;
  villeActive: string;
  q: string;
  taux: number;
  dureeMois: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [replie, setReplie] = useState(false);
  const [recherche, setRecherche] = useState(q);

  const navig = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    for (const [k, val] of Object.entries(patch)) {
      if (val) params.set(k, val);
      else params.delete(k);
    }
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const BarreRecherche = (
    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-champ border border-bordure bg-carte px-3 py-2.5">
      <span className="shrink-0 text-tertiaire">🔍</span>
      <input
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") navig({ q: recherche || undefined }); }}
        placeholder="Rechercher une ville, un service…"
        className="min-w-0 flex-1 bg-transparent text-sm text-principal outline-none placeholder:text-tertiaire"
      />
    </div>
  );

  const FiltresContenu = (
    <div className="space-y-5">
      <div>
        <div className="mb-2 text-xs text-secondaire">Catégorie</div>
        <div className="flex flex-col gap-1.5">
          {CATS.map((c) => {
            const on = serviceActif === c.v;
            return (
              <button
                key={c.v || "tous"}
                onClick={() => { navig({ service: c.v || undefined }); setDrawer(false); }}
                className={
                  "flex items-center gap-2 rounded-petit px-2.5 py-2 text-left text-[13px] " +
                  (on ? "bg-tint-succes font-medium text-texte-succes" : "text-pill-texte")
                }
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs text-secondaire">Ville</div>
        <select
          value={villeActive}
          onChange={(e) => { navig({ ville: e.target.value || undefined }); setDrawer(false); }}
          className="w-full rounded-petit border border-bordure bg-carte px-2.5 py-2 text-[13px] text-principal outline-none focus:border-feuille"
        >
          <option value="">Toutes les villes</option>
          {villes.map((v) => (
            <option key={v.id} value={v.id}>{v.nom}</option>
          ))}
        </select>
      </div>

      <button onClick={() => { navig({ service: undefined, ville: undefined, q: undefined, tri: undefined }); setDrawer(false); }} className="text-xs text-action-verte">
        Réinitialiser les filtres
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* HEADER collant : logo + recherche + actions + chips */}
      <header className="sticky top-0 z-10 border-b border-bordure bg-carte/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Accueil"><Logo className="h-9" /></Link>
          <div className="hidden flex-1 md:flex">{BarreRecherche}</div>
          <div className="ml-auto flex items-center gap-3">
            <NotificationsBell />
            <Link href="/messages" aria-label="Messages" className="text-action-verte">💬</Link>
            <Link href="/publier" className="flex items-center gap-1.5 rounded-champ bg-feuille px-3 py-2 text-sm font-medium text-sur-vert">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Publier</span>
            </Link>
          </div>
        </div>

        {/* Recherche (mobile) */}
        <div className="mt-2.5 flex md:hidden">{BarreRecherche}</div>

        {/* Chips catégories + bouton Filtres */}
        <div className="no-scrollbar mt-2.5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setDrawer(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-pill border border-bordure-forte bg-carte px-3 py-1.5 text-xs font-medium text-pill-texte md:hidden"
          >
            ⚙️ Filtres
          </button>
          {CATS.map((c) => {
            const on = serviceActif === c.v;
            return (
              <button
                key={c.v || "tous"}
                onClick={() => navig({ service: c.v || undefined })}
                className={
                  "shrink-0 whitespace-nowrap rounded-pill px-3 py-1.5 text-xs font-medium " +
                  (on ? "bg-feuille text-sur-vert" : "bg-pill-fond text-pill-texte")
                }
              >
                {c.emoji ? `${c.emoji} ` : ""}{c.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* BANNIÈRE parrainage compacte repliable */}
      <section className="px-4 pt-4 md:px-8">
        {replie ? (
          <button
            onClick={() => setReplie(false)}
            className="flex w-full items-center gap-2 rounded-pill bg-foret px-4 py-2 text-left"
          >
            <span>🎁</span>
            <span className="flex-1 text-xs font-medium text-sur-foret">Gagnez {taux}% en parrainant</span>
            <span className="text-sur-foret-mute">⌄</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-carte bg-foret px-4 py-3">
            <span className="text-xl">🎁</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium leading-snug text-sur-foret md:text-sm">
                Ne faites pas que dépenser — gagnez <span className="text-feuille-clair">{taux}%</span> sur chaque recharge de vos filleuls
              </div>
              <div className="hidden text-xs text-sur-foret-mute md:block">
                pendant {dureeMois} mois, crédité automatiquement.
              </div>
            </div>
            <Link href="/compte" className="shrink-0 rounded-champ bg-feuille px-3.5 py-2 text-xs font-medium text-sur-vert">
              Mon code
            </Link>
            <button onClick={() => setReplie(true)} aria-label="Replier" className="shrink-0 text-sur-foret-mute">⌃</button>
          </div>
        )}
      </section>

      {/* CORPS : sidebar (ordinateur) + grille */}
      <div className="flex items-start gap-6 px-4 py-5 md:px-8">
        <aside className="hidden w-48 shrink-0 rounded-carte border border-bordure bg-carte p-4 md:block">
          <div className="mb-3 text-sm font-medium text-principal">Filtrer</div>
          {FiltresContenu}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] font-medium text-principal">{profils.length} annonces</span>
            <select
              value={tri}
              onChange={(e) => navig({ tri: e.target.value || undefined })}
              aria-label="Trier les résultats"
              className="rounded-petit border border-bordure-forte bg-carte px-2.5 py-1.5 text-xs text-pill-texte outline-none focus:border-feuille"
            >
              <option value="">Trier : pertinence</option>
              <option value="note">Mieux notés</option>
              <option value="dispo">Disponibles d'abord</option>
            </select>
          </div>

          {profils.length === 0 ? (
            <div className="rounded-carte border border-bordure bg-carte p-10 text-center text-sm text-secondaire">
              Aucune annonce pour le moment. Publiez la première !
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profils.map((p) => (
                <ProfilCard key={p.id} profil={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Tiroir filtres (mobile) */}
      {drawer && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-foret-fonce/40" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-carte bg-carte p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-medium text-principal">Filtres</span>
              <button onClick={() => setDrawer(false)} aria-label="Fermer"><X className="h-5 w-5 text-secondaire" /></button>
            </div>
            {FiltresContenu}
          </div>
        </div>
      )}
    </div>
  );
}
