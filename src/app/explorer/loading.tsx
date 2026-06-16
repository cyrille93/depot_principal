import { SkeletonGrid } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* En-tête simplifié */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-bordure bg-carte px-4 py-3 md:px-8">
        <div className="h-9 w-32 animate-pulse rounded-petit bg-surface-neutre" />
        <div className="h-9 flex-1 animate-pulse rounded-champ bg-surface-neutre" />
      </div>

      <div className="flex items-start gap-6 px-4 py-5 md:px-8">
        {/* Sidebar filtres (squelette) */}
        <aside className="hidden w-44 shrink-0 space-y-3 rounded-carte border border-bordure bg-carte p-4 md:block">
          <div className="h-4 w-20 animate-pulse rounded bg-surface-neutre" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full animate-pulse rounded-petit bg-surface-neutre" />
          ))}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 h-5 w-44 animate-pulse rounded bg-surface-neutre" />
          <SkeletonGrid n={9} />
        </main>
      </div>
    </div>
  );
}
