"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Rocket, Pause, Play, Trash2 } from "lucide-react";
import { fcfa } from "@/lib/mock";
import { basculerMonAnnonce, supprimerMonAnnonce } from "@/app/actions/annonces";
import { useToast } from "@/components/Toast";

export type AnnonceItem = {
  id: string;
  titre: string;
  statut: string;
  prix: number;
  ville: string;
  tier: string | null; // niveau de mise en avant actif, sinon null
};

const STATUT: Record<string, { label: string; cls: string }> = {
  BROUILLON: { label: "Brouillon", cls: "bg-surface-neutre text-secondaire" },
  EN_ATTENTE: { label: "En attente", cls: "bg-pill-fond text-pill-texte" },
  ACTIVE: { label: "En ligne", cls: "bg-tint-succes text-texte-succes" },
  SUSPENDUE: { label: "Suspendue", cls: "bg-surface-neutre text-secondaire" },
  REFUSEE: { label: "Refusée", cls: "bg-pill-fond text-vip" },
  SUPPRIMEE: { label: "Supprimée", cls: "bg-surface-neutre text-tertiaire" },
};

export function MesAnnoncesListe({ annonces: init }: { annonces: AnnonceItem[] }) {
  const toast = useToast();
  const [annonces, setAnnonces] = useState(init);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const basculer = async (a: AnnonceItem) => {
    setBusy(a.id);
    const res = await basculerMonAnnonce(a.id);
    setBusy(null);
    if (res.ok && res.statut) {
      setAnnonces((list) => list.map((x) => (x.id === a.id ? { ...x, statut: res.statut! } : x)));
      toast(res.statut === "SUSPENDUE" ? "Annonce mise en pause." : "Annonce remise en ligne.", "success");
    } else toast(res.error ?? "Erreur.", "error");
  };

  const supprimer = async (id: string) => {
    setBusy(id);
    const res = await supprimerMonAnnonce(id);
    setBusy(null);
    setConfirmId(null);
    if (res.ok) {
      setAnnonces((list) => list.filter((x) => x.id !== id));
      toast("Annonce supprimée.", "success");
    } else toast(res.error ?? "Erreur.", "error");
  };

  if (annonces.length === 0) {
    return <p className="py-6 text-center text-sm text-tertiaire">Vous n'avez pas encore d'annonce.</p>;
  }

  return (
    <ul className="divide-y divide-bordure">
      {annonces.map((a) => {
        const s = STATUT[a.statut] ?? STATUT.BROUILLON;
        const basculable = a.statut === "ACTIVE" || a.statut === "SUSPENDUE";
        const supprimable = a.statut !== "SUPPRIMEE";
        return (
          <li key={a.id} className="py-3">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-principal">{a.titre}</div>
                <div className="text-[11px] text-secondaire">{a.ville} · {fcfa(a.prix)}</div>
              </div>
              {a.tier && (
                <span className="shrink-0 rounded-pill bg-tint-succes px-2.5 py-0.5 text-[11px] font-medium text-texte-succes">
                  {a.tier}
                </span>
              )}
              <span className={"shrink-0 rounded-pill px-2.5 py-0.5 text-[11px] " + s.cls}>{s.label}</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href={`/annonce/${a.id}/modifier`}
                className="flex items-center gap-1.5 rounded-champ border border-bordure px-3 py-1.5 text-xs font-medium text-principal"
              >
                <Pencil className="h-3.5 w-3.5" /> Modifier
              </Link>
              <Link
                href={`/booster/${a.id}`}
                className="flex items-center gap-1.5 rounded-champ border border-feuille px-3 py-1.5 text-xs font-medium text-action-verte"
              >
                <Rocket className="h-3.5 w-3.5" /> Booster
              </Link>
              {basculable && (
                <button
                  onClick={() => basculer(a)}
                  disabled={busy === a.id}
                  className="flex items-center gap-1.5 rounded-champ border border-bordure px-3 py-1.5 text-xs font-medium text-principal disabled:opacity-50"
                >
                  {a.statut === "ACTIVE" ? <><Pause className="h-3.5 w-3.5" /> Mettre en pause</> : <><Play className="h-3.5 w-3.5" /> Remettre en ligne</>}
                </button>
              )}
              {supprimable && (
                confirmId === a.id ? (
                  <span className="flex items-center gap-1">
                    <button
                      onClick={() => supprimer(a.id)}
                      disabled={busy === a.id}
                      className="rounded-champ bg-vip px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-champ border border-bordure px-3 py-1.5 text-xs text-principal"
                    >
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmId(a.id)}
                    className="flex items-center gap-1.5 rounded-champ border border-bordure px-3 py-1.5 text-xs font-medium text-vip"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                )
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
