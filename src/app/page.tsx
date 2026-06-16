import { t, defaultLocale } from "@/i18n";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { listerAnnonces } from "@/lib/annonces";
import { compterMessagesNonLus } from "@/lib/messages";
import { ProfilCard } from "@/components/ProfilCard";
import { RechercheHome } from "@/components/RechercheHome";
import { NotificationsBell } from "@/components/NotificationsBell";
import { Logo } from "@/components/Logo";
import { JsonLd } from "@/components/JsonLd";
import { MARQUE_SEO, SITE_URL } from "@/lib/seo";
import { getParrainageConfig } from "@/lib/parametres";
import { Heart, Sparkles, Flower2, ShoppingBag, MessageSquare, Wallet, Gift } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const l = defaultLocale;
  const session = await auth();
  const [tous, villes, nbRencontre, nbMassage, nbSpa, nbProduits] = await Promise.all([
    listerAnnonces(undefined, session?.user?.id),
    db.ville.findMany({ where: { actif: true }, orderBy: { nom: "asc" }, select: { id: true, nom: true } }),
    db.annonce.count({ where: { statut: "ACTIVE", categorie: "RENCONTRE" } }),
    db.annonce.count({ where: { statut: "ACTIVE", categorie: "MASSAGE" } }),
    db.annonce.count({ where: { statut: "ACTIVE", categorie: "SPA" } }),
    db.annonce.count({ where: { statut: "ACTIVE", categorie: "PRODUITS" } }),
  ]);

  const vedettes = tous.slice(0, 6);
  const nonLus = session?.user ? await compterMessagesNonLus(session.user.id) : 0;
  const { taux, dureeMois } = await getParrainageConfig();
  const gainExemple = Math.round((10000 * taux) / 100);

  const CATEGORIES = [
    { v: "RENCONTRE", label: "Rencontres", desc: "Escortes & rencontres", Icon: Heart, count: nbRencontre },
    { v: "MASSAGE", label: "Massages", desc: "Massage & bien-être", Icon: Sparkles, count: nbMassage },
    { v: "SPA", label: "Spa", desc: "Spa & détente", Icon: Flower2, count: nbSpa },
    { v: "PRODUITS", label: "Produits adultes", desc: "Jouets & accessoires", Icon: ShoppingBag, count: nbProduits },
  ];

  return (
    <main className="min-h-screen pb-24 md:pb-0">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: MARQUE_SEO,
          url: SITE_URL,
          logo: `${SITE_URL}/logo-rose-annonce.png`,
          areaServed: "CM",
        }}
      />
      {/* Barre de navigation */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-bordure bg-carte/95 px-4 py-3 backdrop-blur md:px-10">
        <a href="/" className="flex items-center gap-2">
          <Logo className="h-9" />
        </a>
        <div className="flex items-center gap-2">
          <a href="/explorer" className="hidden px-3 py-2 text-sm font-medium text-secondaire sm:block">
            Explorer
          </a>
          {session?.user && (
            <>
              <NotificationsBell />
              <a
                href="/messages"
                className="relative flex items-center gap-1.5 rounded-champ border border-bordure px-3 py-2 text-sm font-medium text-principal"
                aria-label="Messages"
              >
                <MessageSquare className="h-4 w-4 text-action-verte" />
                <span className="hidden sm:inline">Messages</span>
                {nonLus > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-feuille px-1 text-[11px] font-medium text-sur-vert">
                    {nonLus}
                  </span>
                )}
              </a>
            </>
          )}
          {session?.user ? (
            <a href="/compte" className="rounded-champ border border-bordure px-4 py-2 text-sm font-medium text-principal">
              Mon compte
            </a>
          ) : (
            <a href="/connexion" className="rounded-champ border border-bordure px-4 py-2 text-sm font-medium text-principal">
              Se connecter
            </a>
          )}
          <a href="/publier" className="rounded-champ bg-feuille px-4 py-2 text-sm font-medium text-sur-vert">
            {t(l, "cta_publier")}
          </a>
        </div>
      </header>

      {/* Bandeau : compteur + recherche + bascules */}
      <RechercheHome villes={villes} count={tous.length} />

      {/* Chips catégories (défilables) */}
      <section className="mt-4 px-3 md:px-10">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          <a href="/explorer" className="shrink-0 rounded-pill bg-feuille px-4 py-2 text-xs font-medium text-sur-vert">
            Tous
          </a>
          {CATEGORIES.map((c) => (
            <a
              key={c.v}
              href={`/explorer?service=${c.v}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-pill-fond px-4 py-2 text-xs font-medium text-pill-texte"
            >
              <c.Icon className="h-3.5 w-3.5" /> {c.label}
            </a>
          ))}
        </div>
      </section>

      {/* Bannière : gagner de l'argent grâce au parrainage */}
      <section className="mx-3 mt-6 md:mx-10">
        <div className="overflow-hidden rounded-carte bg-foret">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-feuille-clair px-3 py-1 text-[11px] font-medium text-sur-vert">
                <Gift className="h-3.5 w-3.5" /> Gagnez de l'argent en parrainant
              </span>
              <h2 className="mt-3 text-xl font-medium leading-snug text-sur-foret md:text-2xl">
                Et si votre réseau vous <span className="text-feuille-clair">rapportait de l'argent</span> ?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-sur-foret-mute">
                Ailleurs, vous ne faites que <span className="text-sur-foret-mute line-through">payer</span>. Sur{" "}
                {MARQUE_SEO}, chaque personne que vous invitez vous <b className="text-sur-foret">rapporte {taux}%</b> sur
                toutes ses recharges, pendant <b className="text-sur-foret">{dureeMois} mois</b> — crédité tout seul sur
                votre portefeuille.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-champ bg-foret-fonce px-3 py-2 text-xs text-sur-foret">
                <Wallet className="h-4 w-4 text-feuille-clair" />
                <span>Exemple : un filleul recharge <b>10 000 F</b> → vous gagnez <b className="text-feuille-clair">{gainExemple.toLocaleString("fr-FR")} F</b>, sans rien faire.</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 md:w-48">
              <a href="/compte" className="rounded-champ bg-feuille px-5 py-3 text-center text-sm font-medium text-sur-vert">
                Gagner avec mon code
              </a>
              <a href="/inscription" className="rounded-champ border border-feuille-clair px-5 py-3 text-center text-sm font-medium text-sur-foret">
                Je m'inscris gratuitement
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Profils en vedette */}
      {vedettes.length > 0 && (
        <section className="mx-3 mt-8 md:mx-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-principal">Profils en vedette</h2>
            <a href="/explorer" className="text-sm font-medium text-action-verte">Voir tout →</a>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vedettes.map((p) => (
              <ProfilCard key={p.id} profil={p} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-10 px-5 py-10 text-center text-sm text-secondaire md:px-10">
        <a href="/annonces" className="font-medium text-action-verte">Toutes les annonces par ville et catégorie</a>
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
          <a href="/cgu" className="text-secondaire">CGU</a>
          <a href="/confidentialite" className="text-secondaire">Confidentialité</a>
          <a href="/mentions-legales" className="text-secondaire">Mentions légales</a>
        </div>
        <div className="mt-2">{t(l, "marque")} — Cameroun · 18+ · profils vérifiés</div>
      </footer>
    </main>
  );
}
