"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

export function ContenuEditor({
  cle,
  titre: t0,
  corps: c0,
  enregistrer,
}: {
  cle: string;
  titre: string;
  corps: string;
  enregistrer: (cle: string, titre: string, corps: string) => Promise<{ ok?: boolean; error?: string }>;
}) {
  const toast = useToast();
  const [titre, setTitre] = useState(t0);
  const [corps, setCorps] = useState(c0);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const r = await enregistrer(cle, titre, corps);
    setBusy(false);
    toast(r.ok ? "Page enregistrée." : r.error ?? "Erreur.", r.ok ? "success" : "error");
  };

  return (
    <div className="rounded-carte border border-bordure bg-carte p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-pill bg-pill-fond px-2.5 py-0.5 text-[11px] font-medium text-pill-texte">/{cle}</span>
        <button
          onClick={save}
          disabled={busy}
          className="rounded-champ bg-feuille px-4 py-1.5 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
      <label className="mb-1 block text-xs text-secondaire">Titre</label>
      <input
        value={titre}
        onChange={(e) => setTitre(e.target.value)}
        className="mb-3 w-full rounded-champ border border-bordure bg-carte px-3 py-2 text-sm text-principal outline-none focus:border-feuille"
      />
      <label className="mb-1 block text-xs text-secondaire">Contenu</label>
      <textarea
        value={corps}
        onChange={(e) => setCorps(e.target.value)}
        rows={12}
        className="w-full rounded-champ border border-bordure bg-carte px-3 py-2 font-mono text-xs leading-relaxed text-principal outline-none focus:border-feuille"
      />
      <p className="mt-1 text-[11px] text-tertiaire">
        Astuce : commencez une ligne par « ## » pour un sous-titre. Laissez une ligne vide entre les paragraphes.
      </p>
    </div>
  );
}
