"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import { signaler } from "@/app/actions/signalement";
import { useToast } from "@/components/Toast";

const MOTIFS = [
  { v: "FAUX_PROFIL", l: "Faux profil" },
  { v: "CONTENU_INAPPROPRIE", l: "Contenu inapproprié" },
  { v: "HARCELEMENT", l: "Harcèlement" },
  { v: "ARNAQUE", l: "Arnaque" },
];

export function SignalerModal({
  cibleType,
  cibleId,
  className,
  label = "Signaler",
  sujet = "cette annonce",
}: {
  cibleType: "ANNONCE" | "PROFIL" | "MESSAGE";
  cibleId: string;
  className?: string;
  label?: string;
  sujet?: string;
}) {
  const toast = useToast();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [busy, setBusy] = useState(false);

  const envoyer = async () => {
    if (!motif) {
      toast("Choisissez un motif.", "error");
      return;
    }
    setBusy(true);
    const res = await signaler(cibleType, cibleId, motif);
    setBusy(false);
    if (res.ok) {
      toast("Signalement envoyé. Merci, notre équipe va l'examiner.", "success");
      setOuvert(false);
      setMotif("");
    } else {
      toast(res.error ?? "Erreur.", "error");
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOuvert(true)} className={className} aria-label="Signaler">
        <Flag className="h-[18px] w-[18px]" />
        {label && <span>{label}</span>}
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-foret-fonce/50" onClick={() => setOuvert(false)} />
          <div className="relative w-full max-w-sm rounded-t-carte bg-carte p-5 sm:rounded-carte">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-medium text-principal">
                <Flag className="h-4 w-4 text-vip" /> Signaler
              </h3>
              <button onClick={() => setOuvert(false)} aria-label="Fermer">
                <X className="h-5 w-5 text-secondaire" />
              </button>
            </div>
            <p className="mb-3 text-sm text-secondaire">Pour quelle raison signalez-vous {sujet} ?</p>

            <div className="space-y-2">
              {MOTIFS.map((m) => (
                <button
                  key={m.v}
                  onClick={() => setMotif(m.v)}
                  className={
                    "flex w-full items-center justify-between rounded-champ border px-3 py-2.5 text-left text-sm " +
                    (motif === m.v ? "border-feuille bg-tint-succes text-principal" : "border-bordure text-principal")
                  }
                >
                  {m.l}
                  <span
                    className={
                      "h-4 w-4 rounded-pill border " +
                      (motif === m.v ? "border-feuille bg-feuille" : "border-bordure-forte")
                    }
                  />
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => setOuvert(false)} className="flex-1 rounded-champ border border-bordure py-2.5 text-sm text-principal">
                Annuler
              </button>
              <button
                onClick={envoyer}
                disabled={busy}
                className="flex-1 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
              >
                {busy ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
