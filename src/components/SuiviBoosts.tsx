"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, Rocket } from "lucide-react";

export type BoostSuivi = {
  id: string;
  titre: string;
  tier: string;
  debut: string; // ISO
  fin: string; // ISO
};

function reste(ms: number) {
  if (ms <= 0) return "Expiré";
  const j = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (j > 0) return `${j}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function dateCourte(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// Courbe descendante du temps restant, avec marqueur "maintenant"
function Courbe({ frac }: { frac: number }) {
  const W = 320;
  const H = 120;
  const p = 14;
  const x0 = p;
  const x1 = W - p;
  const yHaut = p;
  const yBas = H - p - 16;
  const f = Math.max(0, Math.min(1, frac)); // fraction écoulée
  const nx = x0 + f * (x1 - x0);
  const ny = yHaut + f * (yBas - yHaut);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Courbe de temps restant">
      {/* aire restante (de maintenant à la fin) */}
      <path d={`M ${nx} ${ny} L ${x1} ${yBas} L ${x1} ${yBas} L ${nx} ${yBas} Z`} fill="#DBF0E3" />
      {/* aire écoulée */}
      <path d={`M ${x0} ${yHaut} L ${nx} ${ny} L ${nx} ${yBas} L ${x0} ${yBas} Z`} fill="#EDEBE4" />
      {/* ligne de décroissance */}
      <line x1={x0} y1={yHaut} x2={x1} y2={yBas} stroke="#1EA85B" strokeWidth="2" strokeLinecap="round" />
      {/* axe bas */}
      <line x1={x0} y1={yBas} x2={x1} y2={yBas} stroke="#E2EADF" strokeWidth="1" />
      {/* marqueur maintenant */}
      <line x1={nx} y1={yHaut - 2} x2={nx} y2={yBas} stroke="#0E7A52" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx={nx} cy={ny} r="4.5" fill="#0E7A52" />
      {/* libellés */}
      <text x={x0} y={H - 4} fontSize="9" fill="#7C8C81">début</text>
      <text x={x1} y={H - 4} fontSize="9" fill="#7C8C81" textAnchor="end">fin</text>
    </svg>
  );
}

export function SuiviBoosts({ boosts }: { boosts: BoostSuivi[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4">
        <Link href="/compte" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Mon compte
        </Link>
      </div>

      <h1 className="flex items-center gap-2 text-xl font-medium text-principal">
        <Rocket className="h-5 w-5 text-action-verte" /> Mes mises en avant
      </h1>

      {boosts.length === 0 ? (
        <div className="mt-6 rounded-carte border border-bordure bg-carte p-10 text-center">
          <p className="text-sm text-secondaire">Aucune mise en avant active.</p>
          <Link href="/compte" className="mt-2 inline-block text-sm font-medium text-action-verte">
            Booster une annonce →
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {boosts.map((b) => {
            const debut = new Date(b.debut).getTime();
            const fin = new Date(b.fin).getTime();
            const total = Math.max(1, fin - debut);
            const restant = fin - now;
            const frac = (now - debut) / total;
            const pct = Math.max(0, Math.min(100, Math.round(((fin - now) / total) * 100)));
            return (
              <div key={b.id} className="rounded-carte border border-bordure bg-carte p-4">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-principal">{b.titre}</span>
                  <span className="shrink-0 rounded-pill bg-tint-succes px-2.5 py-0.5 text-[11px] font-medium text-texte-succes">
                    {b.tier}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  <Clock className="h-4 w-4 text-action-verte" />
                  <span className="text-secondaire">Temps restant :</span>
                  <b className={restant <= 0 ? "text-vip" : "text-principal"}>{reste(restant)}</b>
                  {restant > 0 && <span className="text-tertiaire">({pct} %)</span>}
                </div>

                <Courbe frac={frac} />

                <div className="mt-1 flex justify-between text-[11px] text-tertiaire">
                  <span>{dateCourte(b.debut)}</span>
                  <span>{dateCourte(b.fin)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
