"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { inscription, type AuthState } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";

const initial: AuthState = {};

export function InscriptionForm({ villes }: { villes: { id: string; nom: string }[] }) {
  const [state, action, pending] = useActionState(inscription, initial);
  const [showPwd, setShowPwd] = useState(false);
  const [aCode, setACode] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast(state.error, "error");
  }, [state, toast]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-carte border border-bordure bg-carte p-6">
        <h1 className="text-xl font-medium text-principal">Créer un compte</h1>
        <p className="mt-1 text-sm text-secondaire">
          Rejoignez Rose Annonce — profils vérifiés, avis réels.
        </p>

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-principal">Nom d'utilisateur <span className="text-vip">*</span></label>
            <input
              name="pseudo"
              type="text"
              required
              minLength={2}
              maxLength={30}
              autoComplete="username"
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              placeholder="Ex. Sandra237"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-principal">Email <span className="text-vip">*</span></label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              placeholder="vous@exemple.cm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-principal">Téléphone <span className="text-vip">*</span></label>
            <input
              name="telephone"
              type="tel"
              required
              autoComplete="tel"
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              placeholder="+237 6 XX XX XX XX"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-principal">Ville <span className="text-vip">*</span></label>
            <select
              name="villeId"
              required
              defaultValue=""
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
            >
              <option value="" disabled>Choisissez votre ville</option>
              {villes.map((v) => (
                <option key={v.id} value={v.id}>{v.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-principal">Mot de passe <span className="text-vip">*</span></label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 pr-10 text-sm text-principal outline-none focus:border-feuille"
                placeholder="8 caractères minimum"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaire"
              >
                {showPwd ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm text-principal">Je suis</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-champ border border-bordure px-3 py-2.5 text-sm text-principal has-[:checked]:border-feuille has-[:checked]:bg-tint-succes">
                <input type="radio" name="role" value="CLIENT" defaultChecked className="accent-feuille" />
                Client
              </label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-champ border border-bordure px-3 py-2.5 text-sm text-principal has-[:checked]:border-feuille has-[:checked]:bg-tint-succes">
                <input type="radio" name="role" value="PRO" className="accent-feuille" />
                Annonceur
              </label>
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm text-principal">Avez-vous un code de parrainage ?</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setACode(false)}
                className={`rounded-champ border px-3 py-2.5 text-sm transition ${!aCode ? "border-feuille bg-tint-succes text-principal" : "border-bordure text-secondaire"}`}
              >
                Non
              </button>
              <button
                type="button"
                onClick={() => setACode(true)}
                className={`rounded-champ border px-3 py-2.5 text-sm transition ${aCode ? "border-feuille bg-tint-succes text-principal" : "border-bordure text-secondaire"}`}
              >
                Oui
              </button>
            </div>
            {aCode && (
              <div className="mt-3">
                <input
                  name="codeParrain"
                  type="text"
                  autoComplete="off"
                  className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
                  placeholder="CONF-XXXXXX"
                />
                <p className="mt-1 text-[11px] text-tertiaire">Le code d'un compte annonceur qui vous a invité.</p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-tertiaire"><span className="text-vip">*</span> Champs obligatoires</p>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-champ bg-feuille px-4 py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
          >
            {pending ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-secondaire">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="font-medium text-action-verte">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
