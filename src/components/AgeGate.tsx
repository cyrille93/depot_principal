"use client";

import { useEffect, useState } from "react";

const CLE = "rose_annonce_majeur";

export function AgeGate() {
  const [pret, setPret] = useState(false);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    try {
      setOk(localStorage.getItem(CLE) === "1");
    } catch {
      setOk(false);
    }
    setPret(true);
  }, []);

  if (!pret || ok) return null;

  const accepter = () => {
    try {
      localStorage.setItem(CLE, "1");
    } catch {
      /* ignore */
    }
    setOk(true);
  };

  const quitter = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foret-fonce/95 p-4">
      <div className="w-full max-w-sm rounded-carte bg-carte p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
          <span className="text-lg font-medium">18+</span>
        </div>
        <h1 className="text-lg font-medium text-principal">Contenu réservé aux adultes</h1>
        <p className="mt-2 text-sm text-secondaire">
          Ce site contient des annonces réservées aux personnes majeures. Vous devez avoir{" "}
          <b>18 ans ou plus</b> pour y accéder.
        </p>
        <p className="mt-2 text-xs text-tertiaire">
          En continuant, vous confirmez être majeur(e) et accepter nos conditions d'utilisation.
        </p>
        <div className="mt-5 space-y-2">
          <button
            onClick={accepter}
            className="w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert"
          >
            J'ai 18 ans ou plus — Entrer
          </button>
          <button
            onClick={quitter}
            className="w-full rounded-champ border border-bordure py-3 text-sm font-medium text-principal"
          >
            Quitter
          </button>
        </div>
        <div className="mt-4 flex justify-center gap-3 text-[11px] text-tertiaire">
          <a href="/cgu" className="underline">CGU</a>
          <a href="/confidentialite" className="underline">Confidentialité</a>
          <a href="/mentions-legales" className="underline">Mentions légales</a>
        </div>
      </div>
    </div>
  );
}
