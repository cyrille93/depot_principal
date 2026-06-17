"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Star, TrendingUp, Crown } from "lucide-react";

const SERVICES = [
  { v: "", l: "Toutes catégories" },
  { v: "RENCONTRE", l: "Rencontre" },
  { v: "MASSAGE", l: "Massage" },
  { v: "SPA", l: "Spa" },
  { v: "PRODUITS", l: "Produits adultes" },
];

const BASCULES = [
  { cle: "urgent", label: "Urgent", Icon: Clock },
  { cle: "vip", label: "VIP", Icon: Star },
  { cle: "top", label: "TOP", Icon: TrendingUp },
  { cle: "premium", label: "Premium", Icon: Crown },
] as const;

type Cle = (typeof BASCULES)[number]["cle"];

export function RechercheHome({
  villes,
  count,
}: {
  villes: { id: string; nom: string }[];
  count: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ville, setVille] = useState("");
  const [service, setService] = useState("");
  const [actifs, setActifs] = useState<Set<Cle>>(new Set());

  const basculer = (c: Cle) =>
    setActifs((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const lancer = () => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (ville) p.set("ville", ville);
    if (service) p.set("service", service);
    if (actifs.size) p.set("tier", [...actifs].join(","));
    const qs = p.toString();
    router.push(qs ? `/?${qs}` : "/");
  };

  const champ =
    "rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille";

  return (
    <section className="bg-tint-succes-2 px-4 py-5 md:px-10">
      <h1 className="mb-3 text-lg text-texte-succes md:text-xl">
        <span className="font-medium text-principal">{count.toLocaleString("fr-FR")}</span>{" "}
        annonces de rencontres &amp; services au Cameroun
      </h1>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-champ border border-bordure bg-carte px-3">
          <Search className="h-[18px] w-[18px] shrink-0 text-tertiaire" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lancer()}
            className="w-full bg-transparent py-2.5 text-sm text-principal outline-none"
            placeholder="Que recherchez-vous ?"
          />
        </div>
        <select value={service} onChange={(e) => setService(e.target.value)} className={champ + " md:w-44"} aria-label="Catégorie">
          {SERVICES.map((s) => (
            <option key={s.v} value={s.v}>{s.l}</option>
          ))}
        </select>
        <select value={ville} onChange={(e) => setVille(e.target.value)} className={champ + " md:w-48"} aria-label="Ville">
          <option value="">Tout le Cameroun</option>
          {villes.map((v) => (
            <option key={v.id} value={v.id}>{v.nom}</option>
          ))}
        </select>
        <button
          onClick={lancer}
          className="flex items-center justify-center gap-2 rounded-champ bg-feuille px-5 py-2.5 text-sm font-medium text-sur-vert"
        >
          <Search className="h-4 w-4" /> Chercher
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {BASCULES.map(({ cle, label, Icon }) => {
          const on = actifs.has(cle);
          return (
            <button
              key={cle}
              onClick={() => basculer(cle)}
              aria-pressed={on}
              className={
                "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors " +
                (on ? "border-feuille bg-feuille text-sur-vert" : "border-bordure bg-carte text-secondaire")
              }
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
