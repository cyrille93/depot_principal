// Carte « squelette » affichée pendant le chargement (sensation de rapidité)
export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-carte border border-bordure bg-carte">
      <div className="h-32 animate-pulse bg-surface-neutre" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface-neutre" />
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-neutre" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-surface-neutre" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ n = 9 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
