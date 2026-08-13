// Filigrane « Rose Annonce » à superposer sur toute photo affichée
// publiquement (carte du feed, galerie de profil, plein écran) : une seule
// ligne de texte, centrée, en grand — pas de motif répété. `mix-blend-mode:
// overlay` garde le texte lisible aussi bien sur une photo claire que sombre.
export function Watermark({
  opacity = 0.55,
  textClassName = "text-2xl sm:text-3xl",
}: {
  opacity?: number;
  textClassName?: string;
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      style={{ mixBlendMode: "overlay" }}
    >
      <span
        className={`whitespace-nowrap font-bold tracking-wide text-white ${textClassName}`}
        style={{ transform: "rotate(-22deg)", opacity }}
      >
        Rose Annonce
      </span>
    </div>
  );
}
