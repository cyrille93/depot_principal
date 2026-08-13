import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import {
  MessageCircle,
  PlusCircle,
  Compass,
  ShieldCheck,
  LogOut,
  FileText,
  Heart,
  MessageSquare,
  Rocket,
  Clock,
  TrendingUp,
  Star,
  Crown,
  Check,
} from "lucide-react";
import { MesAnnoncesListe } from "@/components/MesAnnoncesListe";
import { DisponibiliteToggle } from "@/components/DisponibiliteToggle";
import { getWhatsappSupport, getTarifsMiseEnAvant, forfaitsGratuits } from "@/lib/parametres";
import { FORFAITS_BOOST } from "@/lib/premium";
import { fcfa } from "@/lib/mock";

const ICONES_FORFAIT: Record<string, typeof Clock> = { URGENT: Clock, TOP: TrendingUp, VIP: Star, PREMIUM: Crown };

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

  // 1re connexion après réinitialisation : forcer le changement de mot de passe
  const compte = await db.user.findUnique({ where: { id: userId }, select: { doitChangerMotDePasse: true, telephone: true } });
  if (compte?.doitChangerMotDePasse) redirect("/changer-mot-de-passe");

  const [profil, annonces, whatsapp, tarifs, gratuit] = await Promise.all([
    db.profil.findUnique({ where: { userId }, include: { ville: true } }),
    role === "PRO"
      ? db.annonce.findMany({
          where: { userId },
          include: { ville: true },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([] as AnnonceRow[]),
    getWhatsappSupport(),
    getTarifsMiseEnAvant(),
    forfaitsGratuits(),
  ]);

  const pseudo = profil?.pseudo ?? session.user.email?.split("@")[0] ?? "Vous";
  const initiales = pseudo.slice(0, 2).toUpperCase();
  const mesAnnonces = annonces as AnnonceRow[];
  const waSupportLink = whatsapp ? `https://wa.me/${whatsapp}` : null;
  const identite = `${pseudo} (${session.user.email ?? compte?.telephone ?? "sans contact"})`;
  const annonceUnique = mesAnnonces.length === 1 ? mesAnnonces[0].titre : null;

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
      </section>

      {/* Accueil annonceur : incitation à publier tant qu'aucune annonce n'existe */}
      {role === "PRO" && mesAnnonces.length === 0 && (
        <section className="mt-4 rounded-carte bg-foret p-5 text-sur-foret">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-pill bg-feuille text-sur-vert">
              <Rocket className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-medium">Lancez-vous : publiez votre première annonce</h2>
              <p className="mt-1 text-sm text-sur-foret-mute">
                Votre compte est prêt. Créez une annonce maintenant pour être visible auprès des clients dès aujourd'hui — c'est gratuit pendant le lancement.
              </p>
            </div>
          </div>
          <Link
            href="/publier"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert"
          >
            <PlusCircle className="h-4 w-4" /> Publier ma première annonce
          </Link>
        </section>
      )}

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

        <Link href="/" className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4">
          <Compass className="h-5 w-5 text-action-verte" />
          <span className="text-sm font-medium text-principal">Explorer</span>
          <span className="text-xs text-secondaire">Parcourir les profils</span>
        </Link>

        {waSupportLink && (
          <a
            href={waSupportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-2 rounded-carte border border-bordure bg-carte p-4"
          >
            <MessageCircle className="h-5 w-5 text-action-verte" />
            <span className="text-sm font-medium text-principal">Contacter le support</span>
            <span className="text-xs text-secondaire">Boost, paiement, assistance — par WhatsApp</span>
          </a>
        )}

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

      {/* Forfaits de mise en avant (annonceur) */}
      {role === "PRO" && (
        <section className="mt-4 rounded-carte border border-bordure bg-carte p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-medium text-principal">
              <Rocket className="h-5 w-5 text-action-verte" /> Forfaits de mise en avant
            </h2>
          </div>
          <p className="mb-3 text-sm text-secondaire">
            {gratuit
              ? "Tous les forfaits sont offerts pendant le lancement — activez-les gratuitement depuis une de vos annonces."
              : "Choisissez un forfait depuis une de vos annonces. Le paiement se fait sur WhatsApp, l'activation est confirmée par l'équipe."}
          </p>

          <div className="space-y-2">
            {FORFAITS_BOOST.map((f) => {
              const Icon = ICONES_FORFAIT[f.v];
              const lienWa = waSupportLink
                ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `Bonjour, je suis ${identite}, compte Professionnel sur Rose Annonce. Je souhaite activer le forfait ${f.label}` +
                      (annonceUnique ? ` sur mon annonce « ${annonceUnique} »` : " sur une de mes annonces") +
                      ". Merci de m'indiquer la marche à suivre."
                  )}`
                : null;
              return (
                <div key={f.v} className="rounded-petit border border-bordure p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-page text-texte-succes">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-principal">{f.label}</span>
                        <span className={`rounded-pill px-1.5 py-0.5 text-[10px] font-medium ${f.badgeClass}`}>{f.label}</span>
                      </div>
                      <div className="text-xs text-secondaire">{f.accroche}</div>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-principal">
                      {gratuit ? "Offert" : `${fcfa(tarifs[f.v] ?? 0)}/j`}
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1 border-t border-bordure pt-2.5">
                    {f.avantages.map((av) => (
                      <li key={av} className="flex items-start gap-2 text-xs text-secondaire">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-action-verte" strokeWidth={2.5} />
                        {av}
                      </li>
                    ))}
                  </ul>
                  {!gratuit && lienWa && (
                    <a
                      href={lienWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 flex items-center justify-center gap-2 rounded-champ bg-feuille py-2 text-xs font-medium text-sur-vert"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Demander {f.label} sur WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {mesAnnonces.length > 0 && (
            <p className="mt-3 text-center text-[11px] text-tertiaire">
              {gratuit
                ? "Ouvrez une annonce ci-dessous et cliquez sur « Booster » pour l'activer gratuitement."
                : "Ouvrez une annonce ci-dessous et cliquez sur « Booster » pour choisir la durée avant de contacter WhatsApp."}
            </p>
          )}
        </section>
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
