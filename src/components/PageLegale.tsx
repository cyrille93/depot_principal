import Link from "next/link";
import { MARQUE_SEO } from "@/lib/seo";

export function PageLegale({ titre, maj, children }: { titre: string; maj?: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between border-b border-bordure bg-carte px-4 py-3 md:px-10">
        <Link href="/" className="text-lg font-medium text-principal">{MARQUE_SEO}</Link>
        <Link href="/" className="rounded-champ bg-feuille px-4 py-2 text-sm font-medium text-sur-vert">
          Explorer
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-medium text-principal">{titre}</h1>
        {maj && <p className="mt-1 text-xs text-tertiaire">Dernière mise à jour : {maj}</p>}
        <div className="legal mt-5 space-y-4 text-sm leading-relaxed text-secondaire">{children}</div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-bordure pt-5 text-xs text-action-verte">
          <Link href="/cgu">CGU</Link>
          <Link href="/confidentialite">Confidentialité</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/">Accueil</Link>
        </div>
      </article>
    </main>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-2 text-base font-medium text-principal">{children}</h2>;
}

// Rend un corps texte : "## Titre" => sous-titre, lignes vides => paragraphes
export function RenduContenu({ corps }: { corps: string }) {
  const blocs = corps.split(/\n\s*\n/);
  return (
    <>
      {blocs.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith("## ")) return <H2 key={i}>{t.slice(3).trim()}</H2>;
        return (
          <p key={i} className="whitespace-pre-line">{t}</p>
        );
      })}
    </>
  );
}
