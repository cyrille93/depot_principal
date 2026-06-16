import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/mock";
import {
  Wallet,
  PlusCircle,
  Compass,
  Gift,
  ShieldCheck,
  LogOut,
  FileText,
  Heart,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { MesAnnoncesListe } from "@/components/MesAnnoncesListe";
import { DisponibiliteToggle } from "@/components/DisponibiliteToggle";

export const dynamic = "force-dynamic";

const LIBELLE_ROLE: Record<string, string> = {
  CLIENT: "Client",
  PRO: "Professionnel",
  ADMIN: "Administrateur",
};

type AnnonceRow = { id: string; titre: string; statut: string; prix: number; miseEnAvant: string; boostExpire: Date | null; ville: { nom: string } };

export default async function ComptePage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");

  const role = session.user.role;
  const userId = session.user.id;

  const [profil, porte, annonces] = await Promise.all([
    db.profil.findUnique({ where: { userId }, include: { ville: true } }),
    db.portefeuille.findUnique({ where: { userId }, select: { solde: true } }),
    role === "PRO"
      ? db.annonce.findMany({
          where: { userId },
          include: { ville: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([] as AnnonceRow[]),
  ]);

  const pseudo = profil?.pseudo ?? session.user.email?.split("@")[0] ?? "Vous";
  const initiales = pseudo.slice(0, 2).toUpperCase();
  const mesAnnonces = annonces as AnnonceRow[];

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-24 md:pb-6">
      {/* En-tête */}
      <section className="rounded-carte bg-foret p-5 text-sur-foret">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-feuille text-base font-medium text-sur-vert">
            {initiales}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-medium">Bonjour, {pseudo}</h1>
              <span className="rounded-pill bg-feuille/20 px-2 py-0.5 text-[11px] text-tint-succes">
                {LIBELLE_ROLE[role] ?? role}
              </span>
            </div>
            <p className="truncate text-sm text-sur-foret-mute">{session.user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-champ bg-foret-fonce/40 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-sur-foret-mute">
            <Wallet className="h-[18px] w-[18px]" /> Solde du portefeuille
          </span>
          <span className="text-lg font-medium text-sur-foret">{fcfa(porte?.solde ?? 0)}</span>
        </div>
      </section>

      {/* Raccourcis */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {role === "PRO" && (
          <Link href="/publier" className="col-span-2 flex items-center gap-3 rounded-carte bg-feuille p-4 text-sur-vert">
            <PlusCircle className="h-6 w-6" />
            <div>
              <div className="text-sm font-medium">Publier une annonce</div>
              <div className="text-xs opacity-80">Mettez votre prestation en ligne</div>
            </div>
          </Link>
        )}

        {role === "PRO" && (
          <Link href="/booster/suivi" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
            <Rocket className="h-5 w-5 text-action-verte" />
            <span className="text-sm font-medium text-principal">Mes mises en avant</span>
            <span className="text-xs text-secondaire">Temps restant &amp; courbe</span>
          </Link>
        )}

        <Link href="/explorer" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
          <Compass className="h-5 w-5 text-action-verte" />
          <span className="text-sm font-medium text-principal">Explorer</span>
          <span className="text-xs text-secondaire">Parcourir les profils</span>
        </Link>

        <Link href="/portefeuille" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
          <Gift className="h-5 w-5 text-action-verte" />
          <span className="text-sm font-medium text-principal">Portefeuille &amp; parrainage</span>
          <span className="text-xs text-secondaire">Solde, recharges, filleuls</span>
        </Link>

        <Link href="/favoris" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
          <Heart className="h-5 w-5" style={{ color: "#E11D48" }} />
          <span className="text-sm font-medium text-principal">Mes favoris</span>
          <span className="text-xs text-secondaire">Vos annonces aimées</span>
        </Link>

        <Link href="/messages" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
          <MessageSquare className="h-5 w-5 text-action-verte" />
          <span className="text-sm font-medium text-principal">Messages</span>
          <span className="text-xs text-secondaire">Vos conversations</span>
        </Link>

        <Link href="/verification" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
          <ShieldCheck className="h-5 w-5 text-feuille" />
          <span className="text-sm font-medium text-principal">Vérifier mon profil</span>
          <span className="text-xs text-secondaire">Téléphone, pièce, selfie</span>
        </Link>

        {role === "ADMIN" && (
          <Link href="/admin" className="col-span-2 flex items-center gap-3 rounded-carte border border-bordure bg-carte p-4">
            <ShieldCheck className="h-5 w-5 text-action-verte" />
            <span className="text-sm font-medium text-principal">Espace administrateur</span>
          </Link>
        )}
      </div>

      {/* Disponibilité (annonceur) */}
      {role === "PRO" && (
        <div className="mt-4">
          <DisponibiliteToggle initial={profil?.disponible ?? true} />
        </div>
      )}

      {/* Mes annonces (annonceur) */}
      {role === "PRO" && (
        <section className="mt-4 rounded-carte border border-bordure bg-carte p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-medium text-principal">
              <FileText className="h-5 w-5 text-action-verte" /> Mes annonces
            </h2>
            <span className="text-xs text-secondaire">{mesAnnonces.length}</span>
          </div>

          {mesAnnonces.length === 0 ? (
            <div className="rounded-petit bg-page py-8 text-center">
              <p className="text-sm text-secondaire">Vous n'avez pas encore d'annonce.</p>
              <Link href="/publier" className="mt-2 inline-block text-sm font-medium text-action-verte">
                Publier ma première annonce →
              </Link>
            </div>
          ) : (
            <MesAnnoncesListe
              annonces={mesAnnonces.map((a) => ({
                id: a.id,
                titre: a.titre,
                statut: a.statut,
                prix: a.prix,
                ville: a.ville.nom,
                tier:
                  !!a.boostExpire && new Date(a.boostExpire) > new Date() && a.miseEnAvant !== "STANDARD"
                    ? a.miseEnAvant
                    : null,
              }))}
            />
          )}
        </section>
      )}

      {/* Déconnexion */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-4"
      >
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-champ border border-bordure bg-carte px-4 py-2.5 text-sm font-medium text-principal"
        >
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </form>
    </main>
  );
}
