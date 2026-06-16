// Logo Rose Annonce. Posé sur une plaque vert forêt foncé (charte) pour garantir
// le contraste des parties claires du logo, quelle que soit la couleur de l'en-tête.
export function Logo({ className = "h-7" }: { className?: string }) {
  return (
    <span className="inline-flex items-center rounded-petit bg-foret-fonce px-2.5 py-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo" alt="Rose Annonce" className={className} />
    </span>
  );
}
