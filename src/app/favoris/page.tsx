import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Heart } from "lucide-react";
import { auth } from "@/auth";
import { listerFavoris } from "@/lib/annonces";
import { ProfilCard } from "@/components/ProfilCard";

export const dynamic = "force-dynamic";

export default async function FavorisPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const profils = await listerFavoris(session.user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-5 pb-24 md:pb-5">
      <div className="mb-4 flex items-center gap-1">
        <Link href="/compte" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Mon compte
        </Link>
      </div>

      <h1 className="flex items-center gap-2 text-xl font-medium text-principal">
        <Heart className="h-5 w-5" style={{ color: "#E11D48" }} fill="#E11D48" /> Mes favoris
      </h1>

      {profils.length === 0 ? (
        <div className="mt-6 rounded-carte border border-bordure bg-carte p-10 text-center">
          <p className="text-sm text-secondaire">Vous n'avez pas encore de favori.</p>
          <Link href="/" className="mt-2 inline-block text-sm font-medium text-action-verte">
            Explorer les profils →
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profils.map((p) => (
            <ProfilCard key={p.id} profil={p} />
          ))}
        </div>
      )}
    </main>
  );
}
