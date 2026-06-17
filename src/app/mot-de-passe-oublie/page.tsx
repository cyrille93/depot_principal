"use client";

import { useState } from "react";
import Link from "next/link";
import { demanderReset } from "@/app/actions/reset";
import { useToast } from "@/components/Toast";

export default function MotDePasseOubliePage() {
  const [identifiant, setIdentifiant] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [pending, setPending] = useState(false);
  const toast = useToast();

  const soumettre = async () => {
    if (identifiant.trim().length < 3) {
      toast("Saisissez votre e-mail ou téléphone.", "error");
      return;
    }
    setPending(true);
    const r = await demanderReset(identifiant);
    setPending(false);
    if (r.error) {
      toast(r.error, "error");
      return;
    }
    setEnvoye(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-carte border border-bordure bg-carte p-6">
        <h1 className="text-xl font-medium text-principal">Mot de passe oublié</h1>

        {envoye ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-champ bg-tint-succes p-4 text-sm text-texte-succes">
              Votre demande a bien été envoyée. Un administrateur va la traiter et vous transmettre un mot de passe
              temporaire. Vous devrez le changer dès votre reconnexion.
            </div>
            <Link href="/connexion" className="block rounded-champ bg-feuille py-2.5 text-center text-sm font-medium text-sur-vert">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-secondaire">
              Indiquez l'e-mail ou le téléphone de votre compte. Un administrateur vous transmettra un mot de passe
              temporaire.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-principal">E-mail ou téléphone</label>
                <input
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") soumettre(); }}
                  className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
                  placeholder="vous@exemple.cm  ou  +237 6 XX XX XX XX"
                />
              </div>
              <button
                onClick={soumettre}
                disabled={pending}
                className="w-full rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
              >
                {pending ? "Envoi…" : "Envoyer la demande"}
              </button>
              <Link href="/connexion" className="block text-center text-sm text-action-verte">
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
