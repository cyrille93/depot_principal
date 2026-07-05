"use client";

import Link from "next/link";

// Pagination numérotée (Précédent / pages / Suivant) qui préserve les filtres en cours.
export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const url = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // Fenêtre de 5 numéros autour de la page courante.
  const end = Math.min(totalPages, Math.max(page + 2, 5));
  const start = Math.max(1, end - 4);
  const numeros: number[] = [];
  for (let i = start; i <= end; i++) numeros.push(i);

  const lien = "rounded-champ border border-bordure px-3.5 py-2 text-sm text-principal transition hover:border-feuille";
  const inactif = "rounded-champ border border-bordure px-3.5 py-2 text-sm text-tertiaire opacity-50";

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      {page > 1 ? (
        <Link href={url(page - 1)} className={lien}>Précédent</Link>
      ) : (
        <span className={inactif}>Précédent</span>
      )}

      {numeros.map((p) =>
        p === page ? (
          <span key={p} className="rounded-champ bg-feuille px-3.5 py-2 text-sm font-medium text-sur-vert" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={url(p)} className={lien}>
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={url(page + 1)} className={lien}>Suivant</Link>
      ) : (
        <span className={inactif}>Suivant</span>
      )}
    </nav>
  );
}
