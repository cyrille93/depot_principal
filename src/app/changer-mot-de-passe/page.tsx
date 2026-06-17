"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changerMonMotDePasse } from "@/app/actions/reset";
import { useToast } from "@/components/Toast";

export default function ChangerMotDePassePage() {
  const [mdp, setMdp] = useState("");
  const [confirme, setConfirme] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const soumettre = async () => {
    if (mdp.length < 6) {
      toast("Le mot de passe doit faire au moins 6 caractères.", "error");
      return;
    }
    if (mdp !== confirme) {
      toast("Les deux mots de passe ne correspondent pas.", "error");
      return;
    }
    setPending(true);
    const r = await changerMonMotDePasse(mdp);
    setPending(false);
    if (r.error) {
      toast(r.error, "error");
      return;
    }
    toast("Mot de passe mis à jour.", "success");
    router.push("/compte");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-carte border border-bordure bg-carte p-6">
        <h1 className="text-xl font-medium text-principal">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-secondaire">
          Pour votre sécurité, choisissez un nouveau mot de passe avant de continuer.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-principal">Nouveau mot de passe</label>
            <input
              type="password"
              value={mdp}
              onChange={(e) => setMdp(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              placeholder="Au moins 6 caractères"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-principal">Confirmer</label>
            <input
              type="password"
              value={confirme}
              onChange={(e) => setConfirme(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") soumettre(); }}
              autoComplete="new-password"
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              placeholder="Retapez le mot de passe"
            />
          </div>
          <button
            onClick={soumettre}
            disabled={pending}
            className="w-full rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : "Valider"}
          </button>
        </div>
      </div>
    </main>
  );
}
