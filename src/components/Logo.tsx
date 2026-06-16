// Logo Rose Annonce, posé sur une plaque vert forêt foncé (charte) pour bien ressortir.
export function Logo({ className = "h-9" }: { className?: string }) {
  return (
    <span className="inline-flex items-center rounded-champ bg-foret-fonce px-3 py-2 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo" alt="Rose Annonce" className={className} />
    </span>
  );
}
