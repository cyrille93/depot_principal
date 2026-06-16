"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { laisserAvis } from "@/app/actions/avis";
import { useToast } from "@/components/Toast";
import type { MonAvis } from "@/lib/annonces";

const CRITERES = [
  { cle: "noteQualite", label: "Qualité du service" },
  { cle: "notePonctualite", label: "Respect du rendez-vous" },
  { cle: "noteAccueil", label: "Accueil" },
  { cle: "noteRapportQualitePrix", label: "Rapport qualité/prix" },
  { cle: "noteSatisfaction", label: "Satisfaction globale" },
] as const;

type Cle = (typeof CRITERES)[number]["cle"];

function Etoiles({
  note,
  onChange,
  size = 26,
}: {
  note: number;
  onChange: (n: number) => void;
  size?: number;
}) {
  const [survol, setSurvol] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const plein = i <= (survol || note);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setSurvol(i)}
            onMouseLeave={() => setSurvol(0)}
            aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
          >
            <Star
              style={{ width: size, height: size, color: "#E0A024" }}
              fill={plein ? "#E0A024" : "transparent"}
              strokeWidth={1.6}
            />
          </button>
        );
      })}
    </div>
  );
}

export function AvisForm({ annonceId, monAvis }: { annonceId: string; monAvis: MonAvis | null }) {
  const toast = useToast();
  const [note, setNote] = useState(monAvis?.note ?? 0);
  const [criteres, setCriteres] = useState<Record<Cle, number>>({
    noteQualite: monAvis?.noteQualite ?? 0,
    notePonctualite: monAvis?.notePonctualite ?? 0,
    noteAccueil: monAvis?.noteAccueil ?? 0,
    noteRapportQualitePrix: monAvis?.noteRapportQualitePrix ?? 0,
    noteSatisfaction: monAvis?.noteSatisfaction ?? 0,
  });
  const [commentaire, setCommentaire] = useState(monAvis?.commentaire ?? "");
  const [ouvert, setOuvert] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const dejaNote = !!monAvis;

  const envoyer = async () => {
    if (note < 1) {
      toast("Attribuez une note globale de 1 à 5 étoiles.", "error");
      return;
    }
    setEnCours(true);
    const payload = {
      note,
      noteQualite: criteres.noteQualite || undefined,
      notePonctualite: criteres.notePonctualite || undefined,
      noteAccueil: criteres.noteAccueil || undefined,
      noteRapportQualitePrix: criteres.noteRapportQualitePrix || undefined,
      noteSatisfaction: criteres.noteSatisfaction || undefined,
      commentaire: commentaire.trim() || undefined,
    };
    const res = await laisserAvis(annonceId, payload);
    setEnCours(false);
    if (res.ok) {
      toast(dejaNote ? "Votre avis a été mis à jour." : "Merci, votre avis a été publié !", "success");
      setOuvert(false);
    } else {
      toast(res.error ?? "Échec de l'envoi.", "error");
    }
  };

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="mt-3 w-full rounded-champ border border-feuille py-2.5 text-sm font-medium text-action-verte"
      >
        {dejaNote ? "Modifier mon avis" : "Laisser un avis"}
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-carte border border-bordure bg-carte p-4">
      <div className="mb-1 text-sm font-medium text-principal">Votre note globale</div>
      <Etoiles note={note} onChange={setNote} />

      <div className="mt-4 space-y-2">
        {CRITERES.map((c) => (
          <div key={c.cle} className="flex items-center justify-between">
            <span className="text-sm text-secondaire">{c.label}</span>
            <Etoiles
              size={18}
              note={criteres[c.cle]}
              onChange={(n) => setCriteres((p) => ({ ...p, [c.cle]: n }))}
            />
          </div>
        ))}
      </div>

      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Partagez votre expérience (facultatif)…"
        className="mt-4 w-full rounded-champ border border-bordure bg-carte p-3 text-sm text-principal outline-none focus:border-feuille"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setOuvert(false)}
          className="flex-1 rounded-champ border border-bordure py-2.5 text-sm text-principal"
        >
          Annuler
        </button>
        <button
          onClick={envoyer}
          disabled={enCours}
          className="flex-1 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          {enCours ? "Envoi…" : "Publier mon avis"}
        </button>
      </div>
    </div>
  );
}
