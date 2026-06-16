// Logo Rose Annonce, posé directement sur l'en-tête clair (fond transparent).
// Légère ombre portée pour garder la partie claire « Annonce » lisible sur fond blanc.
export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo"
      alt="Rose Annonce"
      className={className}
      style={{ filter: "drop-shadow(0 1px 1.5px rgba(21,41,30,0.25))" }}
    />
  );
}
