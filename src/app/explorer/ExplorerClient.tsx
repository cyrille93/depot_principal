"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Heart,
  MessageCircle,
  Plus,
  Star,
  X,
} from "lucide-react";
import { CATEGORIES, type ProfilFictif } from "@/lib/mock";
import { ProfilCard } from "@/components/ProfilCard";
import { NotificationsBell } from "@/components/NotificationsBell";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="inline-flex items-center rounded-petit bg-foret-fonce px-2.5 py-1.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo" alt="Rose Annonce" className="h-7" />
      </span>
    </Link>
  );
}

function Filtres({ cats, toggleCat }: { cats: Set<string>; toggleCat: (c: string) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-principal">Filtres</span>
          <button className="text-xs text-action-verte">Réinitialiser</button>
        </div>
        <div className="space-y-2">
          {CATEGORIES.map((c) => {
            const on = cats.has(c);
            return (
              <label key={c} className="flex cursor-pointer items-center gap-2 text-sm text-principal">
                <span
                  className={
                    on
                      ? "flex h-[17px] w-[17px] items-center justify-center rounded-petit bg-feuille"
                      : "h-[17px] w-[17px] rounded-petit border border-bordure-forte"
                  }
                >
                  {on && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none">
                      <path d="M20 7L9.5 17.5 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggleCat(c)} />
                {c}
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs text-secondaire">Prix (FCFA)</div>
        <div className="relative h-1 rounded-pill bg-bordure">
          <span className="absolute left-0 h-1 w-3/5 rounded-pill bg-feuille" />
          <span className="absolute left-[58%] top-[-5px] h-3.5 w-3.5 rounded-pill bg-feuille" />
        </div>
        <div className="mt-1.5 text-[11px] text-tertiaire">5 000 – 30 000</div>
      </div>

      <div>
        <div className="mb-2 text-xs text-secondaire">Note minimum</div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-4 w-4 text-etoile" fill="#E0A024" strokeWidth={0} />
          ))}
          <Star className="h-4 w-4 text-bordure-forte" fill="#DCE3D7" strokeWidth={0} />
          <span className="ml-1 text-xs text-secondaire">4+</span>
        </div>
      </div>
    </div>
  );
}

export function ExplorerClient({ profils, tri }: { profils: ProfilFictif[]; tri: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cats, setCats] = useState<Set<string>>(new Set());
  const [drawer, setDrawer] = useState(false);

  const changerTri = (value: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) params.set("tri", value);
    else params.delete("tri");
    const qs = params.toString();
    router.push(qs ? `/explorer?${qs}` : "/explorer");
  };

  const toggleCat = (c: string) =>
    setCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const liste = useMemo(
    () => (cats.size === 0 ? profils : profils.filter((p) => cats.has(p.categorie))),
    [cats, profils]
  );

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-bordure bg-carte px-4 py-3 md:px-8">
        <Logo />
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-champ border border-bordure bg-page px-3 py-2 text-tertiaire">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <span className="truncate text-sm">Rechercher à Douala…</span>
        </div>
        <NotificationsBell />
        <Link href="/messages" aria-label="Messages" className="hidden text-action-verte md:block">
          <MessageCircle className="h-5 w-5" />
        </Link>
        <Link href="/favoris" aria-label="Favoris" className="hidden text-secondaire md:block">
          <Heart className="h-5 w-5" />
        </Link>
        <Link href="/publier" className="flex items-center gap-1.5 rounded-champ bg-feuille px-3 py-2 text-sm font-medium text-sur-vert">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Publier</span>
        </Link>
        <span className="hidden h-8 w-8 items-center justify-center rounded-pill bg-foret text-xs font-medium text-tint-succes md:flex">
          SK
        </span>
      </header>

      <div className="flex items-center gap-2 bg-tint-succes-2 px-4 py-2.5 md:px-8">
        <ShieldCheck className="h-[18px] w-[18px] shrink-0 text-action-verte" />
        <span className="text-xs text-texte-succes">
          Identité vérifiée par selfie · avis réels après prestation · paiement Mobile Money
        </span>
      </div>

      <div className="flex items-start gap-6 px-4 py-5 md:px-8">
        <aside className="hidden w-44 shrink-0 rounded-carte border border-bordure bg-carte p-4 md:block">
          <Filtres cats={cats} toggleCat={toggleCat} />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] font-medium text-principal">
              {liste.length} profils près de vous
            </span>
            <div className="flex items-center gap-2">
              <select
                value={tri}
                onChange={(e) => changerTri(e.target.value)}
                aria-label="Trier les résultats"
                className="rounded-petit border border-bordure-forte bg-carte px-2.5 py-1.5 text-xs text-pill-texte outline-none focus:border-feuille"
              >
                <option value="">Trier : pertinence</option>
                <option value="note">Mieux notés</option>
                <option value="dispo">Disponibles d'abord</option>
              </select>
              <button
                onClick={() => setDrawer(true)}
                className="flex items-center gap-1.5 rounded-petit border border-bordure-forte bg-carte px-2.5 py-1.5 text-xs text-action-verte md:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtrer
              </button>
            </div>
          </div>

          {liste.length === 0 ? (
            <div className="rounded-carte border border-bordure bg-carte p-10 text-center text-sm text-secondaire">
              Aucune annonce pour le moment. Publiez la première !
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((p) => (
                <ProfilCard key={p.id} profil={p} />
              ))}
            </div>
          )}
        </main>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-foret-fonce/40" onClick={() => setDrawer(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-carte bg-carte p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-medium text-principal">Filtres</span>
              <button onClick={() => setDrawer(false)} aria-label="Fermer">
                <X className="h-5 w-5 text-secondaire" />
              </button>
            </div>
            <Filtres cats={cats} toggleCat={toggleCat} />
            <button
              onClick={() => setDrawer(false)}
              className="mt-6 w-full rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert"
            >
              Voir les {liste.length} profils
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
