import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fcfa } from "@/lib/mock";
import { AdminClient } from "@/components/AdminClient";
import { validerAnnonce, refuserAnnonce, traiterSignalement, validerVerification, refuserVerification, suspendreAnnonce, reactiverAnnonce, supprimerAnnonceAdmin, suspendreCompte, reactiverCompte } from "@/app/actions/moderation";
import { genererMotDePasseTemporaire, rejeterDemandeReset } from "@/app/actions/reset";
import { contacterUtilisateur } from "@/app/actions/messages";
import { enregistrerContenuPage } from "@/app/actions/contenus";
import { enregistrerParrainage, enregistrerLogo, reinitialiserLogo } from "@/app/actions/parametres";
import { getParrainageConfig } from "@/lib/parametres";
import { getTousContenus, CLES_CONTENU } from "@/lib/contenus";

export const dynamic = "force-dynamic";

const CATL: Record<string, string> = { RENCONTRE: "Rencontre", MASSAGE: "Massage", SPA: "Spa", PRODUITS: "Produits" };
const MOTIFL: Record<string, string> = { FAUX_PROFIL: "Faux profil", CONTENU_INAPPROPRIE: "Contenu inapproprié", HARCELEMENT: "Harcèlement", ARNAQUE: "Arnaque" };
const CIBLEL: Record<string, string> = { PROFIL: "Profil", ANNONCE: "Annonce", MESSAGE: "Message" };

type EnAttenteRow = {
  id: string;
  titre: string;
  categorie: string;
  user: { email: string | null; profil: { pseudo: string } | null };
  ville: { nom: string };
};
type SignalementRow = { id: string; cibleType: string; cibleId: string; motif: string };
type VerifRow = { id: string; type: string; documentUrl: string | null; user: { email: string | null; profil: { pseudo: string } | null } };
type UserRow = {
  id: string;
  email: string | null;
  telephone: string | null;
  role: string;
  statut: string;
  niveauVerification: number;
  profil: { pseudo: string } | null;
  parrainageRecu: { parrain: { email: string | null; telephone: string | null; profil: { pseudo: string } | null } } | null;
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  if (session.user.role !== "ADMIN") redirect("/explorer");

  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const seuilEnLigne = new Date(Date.now() - 5 * 60 * 1000);

  const [nbUsers, nbActives, nbSignal, commAgg, rechAgg, enAttente, signalements, verifsPending, usersRows, enLigne, parrainagesRows, toutesAnnoncesRows] = await Promise.all([
    db.user.count(),
    db.annonce.count({ where: { statut: "ACTIVE" } }),
    db.signalement.count({ where: { statut: "OUVERT" } }),
    db.commission.aggregate({ _sum: { montant: true }, where: { statut: "VERSEE" } }),
    db.recharge.aggregate({ _sum: { montant: true }, where: { statut: "CONFIRMEE", createdAt: { gte: debutMois } } }),
    db.annonce.findMany({
      where: { statut: "EN_ATTENTE" },
      include: { user: { include: { profil: true } }, ville: true },
      orderBy: { createdAt: "desc" },
    }),
    db.signalement.findMany({ where: { statut: "OUVERT" }, orderBy: { createdAt: "desc" } }),
    db.verification.findMany({
      where: { statut: "EN_ATTENTE", type: { in: ["IDENTITE", "SELFIE"] } },
      include: { user: { include: { profil: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true, email: true, telephone: true, role: true, statut: true, niveauVerification: true,
        profil: { select: { pseudo: true } },
        parrainageRecu: { select: { parrain: { select: { email: true, telephone: true, profil: { select: { pseudo: true } } } } } },
      },
    }),
    db.user.count({ where: { derniereActivite: { gte: seuilEnLigne } } }),
    db.parrainage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        parrain: { select: { email: true, telephone: true, profil: { select: { pseudo: true } } } },
        filleul: { select: { email: true, telephone: true, profil: { select: { pseudo: true } } } },
        commissions: { select: { montant: true, statut: true } },
      },
    }),
    db.annonce.findMany({
      where: { statut: { not: "SUPPRIMEE" } },
      include: { user: { include: { profil: true } }, ville: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const stats = {
    utilisateurs: String(nbUsers),
    annoncesActives: String(nbActives),
    revenus: fcfa(rechAgg._sum.montant ?? 0),
    signalements: String(nbSignal),
    commissions: fcfa(commAgg._sum.montant ?? 0),
    enLigne: String(enLigne),
  };

  const annonces = enAttente.map((a: EnAttenteRow) => ({
    id: a.id,
    titre: a.titre,
    pseudo: a.user.profil?.pseudo ?? a.user.email?.split("@")[0] ?? "Pro",
    ville: a.ville.nom,
    cat: CATL[a.categorie] ?? a.categorie,
  }));

  // Toutes les annonces (hors supprimées) pour consultation + modération
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toutesAnnonces = toutesAnnoncesRows.map((a: any) => ({
    id: a.id,
    titre: a.titre,
    pseudo: a.user.profil?.pseudo ?? a.user.email?.split("@")[0] ?? "Pro",
    ville: a.ville.nom,
    prix: a.prix,
    statut: a.statut as string,
    cat: CATL[a.categorie] ?? a.categorie,
  }));

  // Résout le titre des annonces signalées
  const idsAnnoncesSignalees = signalements
    .filter((s: SignalementRow) => s.cibleType === "ANNONCE")
    .map((s: SignalementRow) => s.cibleId);
  const annoncesSignalees = idsAnnoncesSignalees.length
    ? await db.annonce.findMany({ where: { id: { in: idsAnnoncesSignalees } }, select: { id: true, titre: true } })
    : [];
  const titreParId = new Map(annoncesSignalees.map((a: { id: string; titre: string }) => [a.id, a.titre]));

  const sigs = signalements.map((s: SignalementRow) => ({
    id: s.id,
    cible:
      s.cibleType === "ANNONCE"
        ? titreParId.get(s.cibleId) ?? "Annonce supprimée"
        : `${CIBLEL[s.cibleType] ?? s.cibleType} ${s.cibleId}`,
    motif: MOTIFL[s.motif] ?? s.motif,
    annonceId: s.cibleType === "ANNONCE" ? s.cibleId : null,
  }));

  const verifs = verifsPending.map((v: VerifRow) => ({
    id: v.id,
    type: v.type === "IDENTITE" ? "Pièce d'identité" : "Selfie",
    pseudo: v.user.profil?.pseudo ?? v.user.email?.split("@")[0] ?? "Utilisateur",
    image: v.documentUrl ?? "",
  }));

  const ROLEL: Record<string, string> = { CLIENT: "Client", PRO: "Annonceur", ADMIN: "Admin" };
  const utilisateurs = usersRows.map((u: UserRow) => {
    const p = u.parrainageRecu?.parrain;
    return {
      id: u.id,
      pseudo: u.profil?.pseudo ?? u.email?.split("@")[0] ?? u.telephone ?? "Utilisateur",
      identifiant: u.email ?? u.telephone ?? "—",
      role: ROLEL[u.role] ?? u.role,
      estAdmin: u.role === "ADMIN",
      suspendu: u.statut === "SUSPENDU",
      niveau: u.niveauVerification,
      parrainPar: p ? (p.profil?.pseudo ?? p.email?.split("@")[0] ?? p.telephone ?? null) : null,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PSTAT: Record<string, string> = { ACTIF: "Actif", SUSPENDU: "Suspendu", EXPIRE: "Expiré" };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parrainages = (parrainagesRows as any[]).map((p) => {
    const versees = p.commissions
      .filter((c: { statut: string }) => c.statut === "VERSEE")
      .reduce((s: number, c: { montant: number }) => s + c.montant, 0);
    return {
      id: p.id,
      parrain: p.parrain.profil?.pseudo ?? p.parrain.email?.split("@")[0] ?? p.parrain.telephone ?? "—",
      filleul: p.filleul.profil?.pseudo ?? p.filleul.email?.split("@")[0] ?? p.filleul.telephone ?? "—",
      date: new Date(p.createdAt).toLocaleDateString("fr-FR"),
      statut: PSTAT[p.statut] ?? p.statut,
      total: fcfa(versees),
      nb: p.commissions.length,
    };
  });

  const contenusObj = await getTousContenus();
  const contenus = CLES_CONTENU.map((cle) => ({ cle, titre: contenusObj[cle].titre, corps: contenusObj[cle].corps }));

  const config = await getParrainageConfig();

  const demandesRows = await db.demandeReset.findMany({
    where: { statut: "OUVERTE" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, telephone: true, profil: { select: { pseudo: true } } } } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const demandesReset = demandesRows.map((d: any) => ({
    id: d.id,
    identifiant: d.identifiant,
    pseudo: d.user.profil?.pseudo ?? d.user.email?.split("@")[0] ?? d.user.telephone ?? "Utilisateur",
    quand: d.createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <AdminClient
      stats={stats}
      annonces={annonces}
      toutesAnnonces={toutesAnnonces}
      signalements={sigs}
      verifs={verifs}
      utilisateurs={utilisateurs}
      parrainages={parrainages}
      enLigne={enLigne}
      contenus={contenus}
      tauxInit={config.taux}
      dureeInit={config.dureeMois}
      validerAnnonce={validerAnnonce}
      refuserAnnonce={refuserAnnonce}
      traiterSignalement={traiterSignalement}
      validerVerification={validerVerification}
      refuserVerification={refuserVerification}
      suspendreAnnonce={suspendreAnnonce}
      reactiverAnnonce={reactiverAnnonce}
      supprimerAnnonceAdmin={supprimerAnnonceAdmin}
      contacterUtilisateur={contacterUtilisateur}
      suspendreCompte={suspendreCompte}
      reactiverCompte={reactiverCompte}
      enregistrerContenuPage={enregistrerContenuPage}
      enregistrerParrainage={enregistrerParrainage}
      enregistrerLogo={enregistrerLogo}
      reinitialiserLogo={reinitialiserLogo}
      demandesReset={demandesReset}
      genererMotDePasseTemporaire={genererMotDePasseTemporaire}
      rejeterDemandeReset={rejeterDemandeReset}
    />
  );
}
