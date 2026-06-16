import { SkeletonGrid } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="h-7 w-64 animate-pulse rounded bg-surface-neutre" />
      <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-surface-neutre" />
      <div className="mt-5"><SkeletonGrid n={9} /></div>
    </div>
  );
}
