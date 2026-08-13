"use client";

import Link from "next/link";
import { ChevronLeft, MessageCircle, CheckCircle2, XCircle } from "lucide-react";

type Compte = {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  role: string;
  statut: string;
  niveauVerification: number;
  annonces: { id: string; titre: string; statut: string }[];
};

export function FicheCompteAdmin({ compte }: { compte: Compte }) {
  const waLink = compte.telephone ? `https://wa.me/${compte.telephone.replace(/\D/g, "")}` : null;

  const info = "rounded-champ border border-bordure bg-carte px-3 py-2 text-sm";

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-5">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-action-verte">
        <ChevronLeft className="h-4 w-4" /> Retour à l'admin
      </Link>

      <h1 className="text-xl font-medium text-principal">{compte.nom}</h1>
      <p className="mt-0.5 text-sm text-secondaire">
        {compte.role} · {compte.statut} · vérification niveau {compte.niveauVerification}/3
      </p>

      {/* Coordonnées */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className={info}>
          <span className="block text-[11px] text-tertiaire">E-mail</span>
          {compte.email ?? "—"}
        </div>
        <div className={info}>
          <span className="block text-[11px] text-tertiaire">Téléphone</span>
          {compte.telephone ?? "—"}
        </div>
      </div>

      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert"
        >
          <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
        </a>
      ) : (
        <p className="mt-3 text-center text-[12px] text-tertiaire">Aucun numéro pour contacter par WhatsApp.</p>
      )}

      {/* Annonces */}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-principal">Annonces ({compte.annonces.length})</h2>
        <div className="mt-2 space-y-2">
          {compte.annonces.length === 0 ? (
            <p className="text-sm text-secondaire">Aucune annonce.</p>
          ) : (
            compte.annonces.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-champ border border-bordure bg-carte px-3 py-2 text-sm">
                <span className="truncate text-principal">{a.titre}</span>
                <span className="ml-2 flex items-center gap-1 text-[12px] text-secondaire">
                  {a.statut === "ACTIVE" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-texte-succes" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-tertiaire" />
                  )}
                  {a.statut}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
