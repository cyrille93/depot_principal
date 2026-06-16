"use client";

import { useState } from "react";
import { definirDisponibilite } from "@/app/actions/profil";
import { useToast } from "@/components/Toast";

export function DisponibiliteToggle({ initial }: { initial: boolean }) {
  const toast = useToast();
  const [dispo, setDispo] = useState(initial);
  const [busy, setBusy] = useState(false);

  const basculer = async () => {
    const cible = !dispo;
    setDispo(cible);
    setBusy(true);
    const res = await definirDisponibilite(cible);
    setBusy(false);
    if (!res.ok) {
      setDispo(!cible);
      toast(res.error ?? "Erreur.", "error");
    } else {
      toast(cible ? "Vous êtes affiché comme disponible." : "Vous êtes affiché comme occupé.", "success");
    }
  };

  return (
    <div className="flex items-center justify-between rounded-carte border border-bordure bg-carte p-4">
      <div>
        <div className="text-sm font-medium text-principal">Disponibilité</div>
        <div className="text-xs text-secondaire">
          {dispo ? "Vous apparaissez comme « Disponible »." : "Vous apparaissez comme « Occupé »."}
        </div>
      </div>
      <button
        onClick={basculer}
        disabled={busy}
        role="switch"
        aria-checked={dispo}
        aria-label="Basculer la disponibilité"
        className={"relative h-7 w-12 shrink-0 rounded-pill transition-colors " + (dispo ? "bg-feuille" : "bg-surface-neutre")}
      >
        <span
          className={"absolute top-0.5 h-6 w-6 rounded-pill bg-carte shadow transition-all " + (dispo ? "left-[22px]" : "left-0.5")}
        />
      </button>
    </div>
  );
}
