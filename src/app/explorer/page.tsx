import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// L'explorer est fusionné avec l'accueil : on redirige en conservant les filtres.
export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) params.set(k, v);
  const qs = params.toString();
  redirect(qs ? `/?${qs}` : "/");
}
