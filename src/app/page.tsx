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
import { Heart, Sparkles, Flower2, ShoppingBag, MapPin, ChevronRight, MessageSquare, Wallet, Gift } from "lucide-react";

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

  // Villes les plus actives (depuis la liste déjà chargée)
  const idParVille = new Map(villes.map((v: { id: string; nom: string }) => [v.nom, v.id]));
  const compteVilles = new Map<string, number>();
  for (const a of tous) compteVilles.set(a.ville, (compteVilles.get(a.ville) ?? 0) + 1);
  const topVilles = [...compteVilles.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const CATEGORIES = [
    { v: "RENCONTRE", label: "Rencontres", desc: "Escortes & rencontres", Icon: Heart, count: nbRencontre },
    { v: "MASSAGE", label: "Massages", desc: "Massage & bien-être", Icon: Sparkles, count: nbMassage },
    { v: "SPA", label: "Spa", desc: "Spa & détente", Icon: Flower2, count: nbSpa },
    { v: "PRODUITS", label: "Produits adultes", desc: "Jouets & accessoires", Icon: ShoppingBag, count: nbProduits },
  ];

  return (
    <main className="min-h-screen">
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
      <header className="flex items-center justify-between border-b border-bordure bg-carte px-4 py-3 md:px-10">
        <a href="/" className="flex items-center gap-2">
          <Logo className="h-7" />
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

      {/* Bannière : gagner de l'argent grâce au parrainage */}
      <section className="mx-3 mt-6 md:mx-10">
        <div className="overflow-hidden rounded-carte bg-foret">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-feuille-clair px-3 py-1 text-[11px] font-medium text-sur-vert">
                <Gift className="h-3.5 w-3.5" /> Nouveau · Programme de parrainage
              </span>
              <h2 className="mt-3 text-xl font-medium leading-snug text-sur-foret md:text-2xl">
                Ici, vous ne faites pas que <span className="text-sur-foret-mute line-through">dépenser</span>{" "}
                — vous <span className="text-feuille-clair">gagnez de l'argent</span>.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-sur-foret-mute">
                Les autres sites d'annonces ne font que vous facturer. {MARQUE_SEO} vous{" "}
                <b className="text-sur-foret">reverse {taux}%</b> sur chaque recharge des personnes que vous
                parrainez, pendant <b className="text-sur-foret">{dureeMois} mois</b>. Plus vous invitez, plus vous
                encaissez — directement dans votre portefeuille.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-sur-foret-mute">
                <span className="flex items-center gap-1.5"><Wallet className="h-4 w-4 text-feuille-clair" /> Crédité automatiquement</span>
                <span className="flex items-center gap-1.5"><Gift className="h-4 w-4 text-feuille-clair" /> Code unique par compte</span>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 md:w-48">
              <a href="/compte" className="rounded-champ bg-feuille px-5 py-3 text-center text-sm font-medium text-sur-vert">
                Obtenir mon code
              </a>
              <a href="/inscription" className="rounded-champ border border-feuille-clair px-5 py-3 text-center text-sm font-medium text-sur-foret">
                Créer un compte
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Le N°1 — villes & catégories */}
      <section className="mx-3 mt-6 md:mx-10">
        <h2 className="text-xl text-principal md:text-2xl">
          Le <span className="font-medium text-feuille">N°1</span> des annonces de rencontres &amp; services au Cameroun
        </h2>

        {/* Villes */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-bordure pb-4">
          {topVilles.map(([nom, n]) => (
            <a key={nom} href={idParVille.get(nom) ? `/explorer?ville=${idParVille.get(nom)}` : "/explorer"} className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-action-verte" strokeWidth={1.75} />
              <span className="text-sm font-medium text-principal">{nom}</span>
              <span className="text-xs text-tertiaire">({n.toLocaleString("fr-FR")})</span>
            </a>
          ))}
          <a href="/explorer" className="flex items-center gap-1 text-sm font-medium text-action-verte">
            Plus de villes <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        {/* Catégories */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <a
              key={c.v}
              href={`/explorer?service=${c.v}`}
              className="group flex items-start gap-3 rounded-carte border border-bordure bg-carte p-4 transition-colors hover:border-bordure-forte"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
                <c.Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-principal">{c.label}</div>
                <div className="text-[11px] text-secondaire">
                  {c.count.toLocaleString("fr-FR")} annonce{c.count > 1 ? "s" : ""}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-action-verte">
                  {c.desc} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </a>
          ))}
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
