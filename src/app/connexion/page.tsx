"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { connexion, type AuthState } from "@/app/actions/auth";
import { useToast } from "@/components/Toast";

const initial: AuthState = {};

export default function ConnexionPage() {
  const [state, action, pending] = useActionState(connexion, initial);
  const [mode, setMode] = useState<"email" | "tel">("email");
  const [showPwd, setShowPwd] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast(state.error, "error");
  }, [state, toast]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-carte border border-bordure bg-carte p-6">
        <h1 className="text-xl font-medium text-principal">Se connecter</h1>
        <p className="mt-1 text-sm text-secondaire">Content de vous revoir.</p>

        {/* Choix du mode de connexion */}
        <div className="mt-5 flex gap-1 rounded-pill bg-pill-fond p-1">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={"flex-1 rounded-pill py-1.5 text-sm " + (mode === "email" ? "bg-carte font-medium text-principal" : "text-pill-texte")}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMode("tel")}
            className={"flex-1 rounded-pill py-1.5 text-sm " + (mode === "tel" ? "bg-carte font-medium text-principal" : "text-pill-texte")}
          >
            Téléphone
          </button>
        </div>

        <form action={action} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-principal">
              {mode === "email" ? "Email" : "Téléphone"} <span className="text-vip">*</span>
            </label>
            <input
              key={mode}
              name="identifiant"
              type={mode === "email" ? "email" : "tel"}
              required
              autoComplete={mode === "email" ? "email" : "tel"}
              className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              placeholder={mode === "email" ? "vous@exemple.cm" : "+237 6 XX XX XX XX"}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-principal">Mot de passe <span className="text-vip">*</span></label>
            <div className="relative">
              <input
                name="password"
                type={showPwd ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 pr-10 text-sm text-principal outline-none focus:border-feuille"
                placeholder="Votre mot de passe"
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

          <p className="text-[11px] text-tertiaire"><span className="text-vip">*</span> Champs obligatoires</p>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-champ bg-feuille px-4 py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>

          <Link href="/mot-de-passe-oublie" className="block text-center text-sm text-action-verte">
            Mot de passe oublié ?
          </Link>
        </form>

        <p className="mt-5 text-center text-sm text-secondaire">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-action-verte">
            Créer un compte
          </Link>
        </p>
      </div>
    </main>
  );
}
