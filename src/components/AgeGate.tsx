"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, #173A28 0%, #0F2A1C 60%, #0B2A18 100%)" }}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* Logo */}
        <div className="mb-7">
          <Logo className="h-10" />
        </div>

        {/* Pastille 18+ */}
        <div className="mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-pill border-2 border-feuille-clair bg-tint-succes">
          <span className="text-2xl font-medium text-texte-succes">18+</span>
        </div>

        <h1 className="text-xl font-medium text-sur-foret">Contenu réservé aux adultes</h1>
        <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-sur-foret-mute">
          Ce site contient des annonces pour adultes. Vous devez avoir <b className="text-sur-foret">18 ans ou plus</b>{" "}
          pour entrer.
        </p>

        <div className="mt-6 w-full space-y-2.5">
          <button
            onClick={accepter}
            className="w-full rounded-champ bg-feuille py-3.5 text-[15px] font-medium text-sur-vert"
          >
            ✅ J'ai 18 ans ou plus — Entrer
          </button>
          <button
            onClick={quitter}
            className="w-full rounded-champ border border-bordure-forte/30 py-3 text-sm font-medium text-sur-foret-mute"
            style={{ borderColor: "#2C4A38" }}
          >
            🚪 Quitter
          </button>
        </div>

        <p className="mt-6 max-w-xs text-[11px] leading-relaxed text-tertiaire">
          En entrant, vous acceptez les{" "}
          <a href="/cgu" className="text-sur-foret-mute underline">CGU</a> et la{" "}
          <a href="/confidentialite" className="text-sur-foret-mute underline">politique de confidentialité</a>.
        </p>
      </div>
    </div>
  );
}
