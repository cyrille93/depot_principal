"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileText,
  Flag,
  Gift,
  ScrollText,
  ImagePlus,
  BarChart3,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Ban,
  Eye,
  Trash2,
  Power,
  KeyRound,
} from "lucide-react";
import { ContenuEditor } from "@/components/ContenuEditor";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/Toast";

const NAV = [
  { label: "Tableau de bord", icon: LayoutDashboard },
  { label: "Utilisateurs", icon: Users },
  { label: "Annonces", icon: FileText },
  { label: "Signalements", icon: Flag },
  { label: "Mots de passe", icon: KeyRound },
  { label: "Parrainage", icon: Gift },
  { label: "Pages légales", icon: ScrollText },
  { label: "Apparence", icon: ImagePlus },
];

export type AdminStats = {
  utilisateurs: string;
  annoncesActives: string;
  revenus: string;
  signalements: string;
  commissions: string;
  enLigne: string;
};
export type AnnonceAttente = { id: string; titre: string; pseudo: string; ville: string; cat: string };
export type SignalementItem = { id: string; cible: string; motif: string; annonceId: string | null };
export type VerifItem = { id: string; type: string; pseudo: string; image: string };
export type AdminUser = { id: string; pseudo: string; identifiant: string; role: string; estAdmin: boolean; suspendu: boolean; niveau: number; parrainPar: string | null };
export type ParrItem = { id: string; parrain: string; filleul: string; date: string; statut: string; total: string; nb: number };
export type ContenuItem = { cle: string; titre: string; corps: string };

export function AdminClient({
  stats,
  annonces: annoncesInit,
  signalements: signalementsInit,
  verifs: verifsInit,
  utilisateurs: utilisateursInit,
  parrainages,
  enLigne,
  contenus,
  tauxInit,
  dureeInit,
  tarifsInit,
  validerAnnonce,
  refuserAnnonce,
  traiterSignalement,
  validerVerification,
  refuserVerification,
  suspendreAnnonce,
  toutesAnnonces: toutesAnnoncesInit,
  reactiverAnnonce,
  supprimerAnnonceAdmin,
  contacterUtilisateur,
  suspendreCompte,
  reactiverCompte,
  enregistrerContenuPage,
  enregistrerParrainage,
  enregistrerTarifs,
  enregistrerLogo,
  reinitialiserLogo,
  demandesReset: demandesResetInit,
  genererMotDePasseTemporaire,
  rejeterDemandeReset,
}: {
  stats: AdminStats;
  annonces: AnnonceAttente[];
  signalements: SignalementItem[];
  verifs: VerifItem[];
  utilisateurs: AdminUser[];
  parrainages: ParrItem[];
  enLigne: number;
  contenus: ContenuItem[];
  tauxInit: number;
  dureeInit: number;
  tarifsInit: Record<string, number>;
  validerAnnonce: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  refuserAnnonce: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  traiterSignalement: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  validerVerification: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  refuserVerification: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  suspendreAnnonce: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  toutesAnnonces: { id: string; titre: string; pseudo: string; ville: string; prix: number; statut: string; cat: string }[];
  reactiverAnnonce: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  supprimerAnnonceAdmin: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  contacterUtilisateur: (id: string) => Promise<{ error?: string }>;
  suspendreCompte: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  reactiverCompte: (id: string) => Promise<{ ok?: boolean; error?: string }>;
  enregistrerContenuPage: (cle: string, titre: string, corps: string) => Promise<{ ok?: boolean; error?: string }>;
  enregistrerParrainage: (taux: number, dureeMois: number) => Promise<{ ok?: boolean; error?: string }>;
  enregistrerTarifs: (tarifs: { URGENT: number; TOP: number; VIP: number; PREMIUM: number }) => Promise<{ ok?: boolean; error?: string }>;
  enregistrerLogo: (dataUrl: string) => Promise<{ ok?: boolean; error?: string }>;
  reinitialiserLogo: () => Promise<{ ok?: boolean; error?: string }>;
  demandesReset: { id: string; identifiant: string; pseudo: string; quand: string }[];
  genererMotDePasseTemporaire: (id: string) => Promise<{ ok?: boolean; error?: string; motDePasse?: string }>;
  rejeterDemandeReset: (id: string) => Promise<{ ok?: boolean; error?: string }>;
}) {
  const toast = useToast();
  const [onglet, setOnglet] = useState("Tableau de bord");
  const [annonces, setAnnonces] = useState(annoncesInit);
  const [demandes, setDemandes] = useState(demandesResetInit);
  const [mdpGeneres, setMdpGeneres] = useState<Record<string, string>>({});
  const [toutesAnnonces, setToutesAnnonces] = useState(toutesAnnoncesInit);
  const [confirmSuppr, setConfirmSuppr] = useState<string | null>(null);
  const [signalements, setSignalements] = useState(signalementsInit);
  const [verifs, setVerifs] = useState(verifsInit);
  const [users, setUsers] = useState(utilisateursInit);
  const [, startTransition] = useTransition();
  const [taux, setTaux] = useState(tauxInit);
  const [duree, setDuree] = useState(dureeInit);
  const [savingParr, setSavingParr] = useState(false);
  const [tarifs, setTarifs] = useState({
    URGENT: tarifsInit.URGENT ?? 1000,
    TOP: tarifsInit.TOP ?? 1500,
    VIP: tarifsInit.VIP ?? 2000,
    PREMIUM: tarifsInit.PREMIUM ?? 3000,
  });
  const [savingTarifs, setSavingTarifs] = useState(false);

  const sauverTarifs = async () => {
    setSavingTarifs(true);
    const r = await enregistrerTarifs(tarifs);
    setSavingTarifs(false);
    toast(r.ok ? "Tarifs enregistrés." : r.error ?? "Erreur.", r.ok ? "success" : "error");
  };
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);

  // Modération depuis la liste complète des annonces
  const majStatutLocal = (id: string, statut: string) =>
    setToutesAnnonces((prev) => prev.map((a) => (a.id === id ? { ...a, statut } : a)));

  const suspendreDepuisListe = (id: string) => {
    majStatutLocal(id, "SUSPENDUE");
    startTransition(async () => {
      const r = await suspendreAnnonce(id);
      toast(r.ok ? "Annonce suspendue." : r.error ?? "Erreur.", r.ok ? "success" : "error");
    });
  };

  const reactiverDepuisListe = (id: string) => {
    majStatutLocal(id, "ACTIVE");
    startTransition(async () => {
      const r = await reactiverAnnonce(id);
      toast(r.ok ? "Annonce remise en ligne." : r.error ?? "Erreur.", r.ok ? "success" : "error");
    });
  };

  const supprimerDepuisListe = (id: string) => {
    setConfirmSuppr(null);
    setToutesAnnonces((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      const r = await supprimerAnnonceAdmin(id);
      toast(r.ok ? "Annonce supprimée." : r.error ?? "Erreur.", r.ok ? "success" : "error");
    });
  };

  // Demandes de réinitialisation de mot de passe
  const genererMdp = (id: string) => {
    startTransition(async () => {
      const r = await genererMotDePasseTemporaire(id);
      if (r.ok && r.motDePasse) {
        setMdpGeneres((m) => ({ ...m, [id]: r.motDePasse! }));
        toast("Mot de passe temporaire généré.", "success");
      } else {
        toast(r.error ?? "Erreur.", "error");
      }
    });
  };

  const rejeterDemande = (id: string) => {
    setDemandes((prev) => prev.filter((d) => d.id !== id));
    startTransition(async () => {
      const r = await rejeterDemandeReset(id);
      toast(r.ok ? "Demande rejetée." : r.error ?? "Erreur.", r.ok ? "success" : "error");
    });
  };

  const sauverParrainage = async () => {
    setSavingParr(true);
    const r = await enregistrerParrainage(taux, duree);
    setSavingParr(false);
    toast(r.ok ? "Paramètres enregistrés." : r.error ?? "Erreur.", r.ok ? "success" : "error");
  };

  const choisirLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        setLogoPreview(canvas.toDataURL("image/png"));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const sauverLogo = async () => {
    if (!logoPreview) return;
    setSavingLogo(true);
    const r = await enregistrerLogo(logoPreview);
    setSavingLogo(false);
    if (r.ok) { toast("Logo mis à jour.", "success"); setLogoPreview(null); window.location.reload(); }
    else toast(r.error ?? "Erreur.", "error");
  };

  const resetLogo = async () => {
    const r = await reinitialiserLogo();
    if (r.ok) { toast("Logo réinitialisé.", "success"); window.location.reload(); }
    else toast(r.error ?? "Erreur.", "error");
  };

  const STATS = [
    { label: "Utilisateurs", valeur: stats.utilisateurs, icon: Users, live: false },
    { label: "En ligne", valeur: stats.enLigne, icon: Users, live: true },
    { label: "Annonces actives", valeur: stats.annoncesActives, icon: FileText, live: false },
    { label: "Revenus du mois", valeur: stats.revenus, icon: BarChart3, live: false },
    { label: "Signalements", valeur: stats.signalements, icon: Flag, live: false },
    { label: "Commissions versées", valeur: stats.commissions, icon: Gift, live: false },
  ];

  const valider = (id: string) => { setAnnonces((a) => a.filter((x) => x.id !== id)); startTransition(() => { validerAnnonce(id); }); };
  const refuser = (id: string) => { setAnnonces((a) => a.filter((x) => x.id !== id)); startTransition(() => { refuserAnnonce(id); }); };
  const traiter = (id: string) => { setSignalements((s) => s.filter((x) => x.id !== id)); startTransition(() => { traiterSignalement(id); }); };
  const suspendre = (sigId: string, annonceId: string) => {
    setSignalements((s) => s.filter((x) => x.id !== sigId));
    startTransition(() => { suspendreAnnonce(annonceId); traiterSignalement(sigId); });
  };
  const validerVerif = (id: string) => { setVerifs((v) => v.filter((x) => x.id !== id)); startTransition(() => { validerVerification(id); }); };
  const refuserVerif = (id: string) => { setVerifs((v) => v.filter((x) => x.id !== id)); startTransition(() => { refuserVerification(id); }); };
  const ecrire = (id: string) => { startTransition(() => { contacterUtilisateur(id); }); };
  const basculerCompte = (u: AdminUser) => {
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, suspendu: !x.suspendu } : x)));
    startTransition(() => { if (u.suspendu) reactiverCompte(u.id); else suspendreCompte(u.id); });
  };

  const AnnoncesSection = (
    <section className="rounded-carte border border-bordure bg-carte p-4">
      <h2 className="mb-3 text-sm font-medium text-principal">Annonces à valider ({annonces.length})</h2>
      <div className="space-y-2">
        {annonces.length === 0 && <p className="py-6 text-center text-sm text-tertiaire">File vide 🎉</p>}
        {annonces.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-petit border border-bordure p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-principal">{a.titre}</div>
              <div className="text-[11px] text-secondaire">{a.pseudo} · {a.cat} · {a.ville}</div>
            </div>
            <button onClick={() => valider(a.id)} className="flex h-8 w-8 items-center justify-center rounded-petit bg-tint-succes text-texte-succes" aria-label="Valider">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button onClick={() => refuser(a.id)} className="flex h-8 w-8 items-center justify-center rounded-petit bg-pill-fond text-pill-texte" aria-label="Refuser">
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const STATUT_LABEL: Record<string, string> = {
    ACTIVE: "En ligne", EN_ATTENTE: "En attente", SUSPENDUE: "Suspendue", REFUSEE: "Refusée", BROUILLON: "Brouillon",
  };
  const statutBadge = (s: string) => {
    if (s === "ACTIVE") return "bg-tint-succes text-texte-succes";
    if (s === "SUSPENDUE") return "bg-vip text-white";
    if (s === "EN_ATTENTE") return "bg-pill-fond text-pill-texte";
    return "bg-surface-neutre text-secondaire";
  };

  const ToutesAnnoncesSection = (
    <section className="rounded-carte border border-bordure bg-carte p-4">
      <h2 className="mb-3 text-sm font-medium text-principal">Toutes les annonces ({toutesAnnonces.length})</h2>
      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {toutesAnnonces.length === 0 && <p className="py-6 text-center text-sm text-tertiaire">Aucune annonce.</p>}
        {toutesAnnonces.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-petit border border-bordure p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm text-principal">{a.titre}</span>
                <span className={`shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium ${statutBadge(a.statut)}`}>
                  {STATUT_LABEL[a.statut] ?? a.statut}
                </span>
              </div>
              <div className="text-[11px] text-secondaire">{a.pseudo} · {a.cat} · {a.ville} · {a.prix.toLocaleString("fr-FR")} F</div>
            </div>

            <Link
              href={`/profil/${a.id}`}
              target="_blank"
              className="flex items-center gap-1 rounded-champ border border-bordure px-2.5 py-1.5 text-xs font-medium text-principal"
            >
              <Eye className="h-3.5 w-3.5" /> Consulter
            </Link>

            {a.statut === "SUSPENDUE" ? (
              <button onClick={() => reactiverDepuisListe(a.id)} className="flex items-center gap-1 rounded-champ bg-tint-succes px-2.5 py-1.5 text-xs font-medium text-texte-succes">
                <Power className="h-3.5 w-3.5" /> Réactiver
              </button>
            ) : (
              <button onClick={() => suspendreDepuisListe(a.id)} className="flex items-center gap-1 rounded-champ bg-vip px-2.5 py-1.5 text-xs font-medium text-white">
                <Ban className="h-3.5 w-3.5" /> Suspendre
              </button>
            )}

            {confirmSuppr === a.id ? (
              <button onClick={() => supprimerDepuisListe(a.id)} className="flex items-center gap-1 rounded-champ bg-vip px-2.5 py-1.5 text-xs font-medium text-white">
                <Trash2 className="h-3.5 w-3.5" /> Confirmer ?
              </button>
            ) : (
              <button onClick={() => setConfirmSuppr(a.id)} className="flex items-center gap-1 rounded-champ border border-bordure px-2.5 py-1.5 text-xs font-medium text-secondaire" aria-label="Supprimer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const DemandesResetSection = (
    <section className="rounded-carte border border-bordure bg-carte p-4">
      <h2 className="mb-1 text-sm font-medium text-principal">Demandes de mot de passe ({demandes.length})</h2>
      <p className="mb-3 text-xs text-secondaire">
        Générez un mot de passe temporaire et transmettez-le à l'utilisateur (WhatsApp, appel…). Il devra le changer dès
        sa prochaine connexion.
      </p>
      <div className="space-y-2">
        {demandes.length === 0 && <p className="py-6 text-center text-sm text-tertiaire">Aucune demande en attente.</p>}
        {demandes.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-petit border border-bordure p-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm text-principal">{d.pseudo}</div>
              <div className="text-[11px] text-secondaire">{d.identifiant} · {d.quand}</div>
            </div>
            {mdpGeneres[d.id] ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-secondaire">Mot de passe :</span>
                <code className="rounded-petit bg-tint-succes px-3 py-1.5 text-sm font-medium tracking-wider text-texte-succes">{mdpGeneres[d.id]}</code>
                <button onClick={() => navigator.clipboard?.writeText(mdpGeneres[d.id])} className="rounded-champ border border-bordure px-2.5 py-1.5 text-xs text-principal">
                  Copier
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => genererMdp(d.id)} className="flex items-center gap-1 rounded-champ bg-feuille px-2.5 py-1.5 text-xs font-medium text-sur-vert">
                  <KeyRound className="h-3.5 w-3.5" /> Générer un mot de passe
                </button>
                <button onClick={() => rejeterDemande(d.id)} className="rounded-champ border border-bordure px-2.5 py-1.5 text-xs text-secondaire">
                  Rejeter
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const SignalementsSection = (
    <section className="rounded-carte border border-bordure bg-carte p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-principal">
        <ShieldAlert className="h-4 w-4 text-vip" /> Signalements ({signalements.length})
      </h2>
      <div className="space-y-2">
        {signalements.length === 0 && <p className="py-6 text-center text-sm text-tertiaire">Aucun signalement.</p>}
        {signalements.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-petit border border-bordure p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-principal">{s.cible}</div>
              <div className="text-[11px] text-vip">{s.motif}</div>
            </div>
            {s.annonceId && (
              <button onClick={() => suspendre(s.id, s.annonceId!)} className="rounded-champ bg-vip px-3 py-1.5 text-xs font-medium text-white">
                Suspendre
              </button>
            )}
            <button onClick={() => traiter(s.id)} className="rounded-champ border border-bordure px-3 py-1.5 text-xs font-medium text-principal">
              Traiter
            </button>
          </div>
        ))}
      </div>
    </section>
  );

  const VerifsSection = (
    <section className="rounded-carte border border-bordure bg-carte p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-principal">
        <ShieldCheck className="h-4 w-4 text-feuille" /> Vérifications en attente ({verifs.length})
      </h2>
      {verifs.length === 0 ? (
        <p className="py-6 text-center text-sm text-tertiaire">Aucune demande de vérification.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {verifs.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-petit border border-bordure p-3">
              {v.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.image} alt="" className="h-14 w-14 shrink-0 rounded-petit object-cover" />
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-petit bg-media" />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-principal">{v.pseudo}</div>
                <div className="text-[11px] text-secondaire">{v.type}</div>
              </div>
              <button onClick={() => validerVerif(v.id)} aria-label="Valider" className="flex h-8 w-8 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
                <Check className="h-4 w-4" />
              </button>
              <button onClick={() => refuserVerif(v.id)} aria-label="Refuser" className="flex h-8 w-8 items-center justify-center rounded-pill bg-pill-fond text-secondaire">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  const UsersSection = (
    <section className="rounded-carte border border-bordure bg-carte p-4">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-principal">
        <Users className="h-4 w-4 text-action-verte" /> Utilisateurs ({users.length})
      </h2>
      <div className="max-h-[32rem] space-y-2 overflow-y-auto">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 rounded-petit border border-bordure p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-foret text-xs font-medium text-tint-succes">
              {u.pseudo.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-principal">{u.pseudo}</span>
                <span className="shrink-0 rounded-pill bg-pill-fond px-2 py-0.5 text-[10px] text-pill-texte">{u.role}</span>
                {u.niveau > 0 && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-feuille" />}
                {u.suspendu && (
                  <span className="shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium" style={{ background: "#FBE3E3", color: "#9B2C2C" }}>
                    Suspendu
                  </span>
                )}
              </div>
              <div className="truncate text-[11px] text-secondaire">{u.identifiant}</div>
              {u.parrainPar && (
                <div className="mt-0.5 inline-flex items-center gap-1 rounded-pill bg-pill-fond px-2 py-0.5 text-[10px] text-pill-texte">
                  <Gift className="h-3 w-3" /> Filleul de {u.parrainPar}
                </div>
              )}
            </div>
            <button onClick={() => ecrire(u.id)} className="flex shrink-0 items-center gap-1.5 rounded-champ border border-feuille px-3 py-1.5 text-xs font-medium text-action-verte">
              <MessageSquare className="h-3.5 w-3.5" /> Écrire
            </button>
            {!u.estAdmin && (
              <button
                onClick={() => basculerCompte(u)}
                title={u.suspendu ? "Réactiver" : "Suspendre"}
                className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-pill " + (u.suspendu ? "bg-tint-succes text-texte-succes" : "bg-pill-fond text-secondaire")}
              >
                {u.suspendu ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  const EnLigneBanner = (
    <div className="mb-4 flex items-center gap-2 rounded-carte border border-bordure bg-tint-succes px-4 py-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-feuille opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-pill bg-feuille" />
      </span>
      <span className="text-sm text-texte-succes">
        <b>{enLigne}</b> personne{enLigne > 1 ? "s" : ""} en ligne actuellement
      </span>
    </div>
  );

  const Ping = (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-feuille opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-pill bg-feuille" />
    </span>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col bg-foret p-4 md:flex">
        <div className="mb-6 flex items-center px-2">
          <Logo className="h-8" />
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => setOnglet(n.label)}
              className={
                "flex w-full items-center gap-2.5 rounded-champ px-3 py-2 text-sm " +
                (onglet === n.label ? "bg-feuille/15 font-medium text-sur-foret" : "text-sur-foret-mute hover:text-sur-foret")
              }
            >
              <n.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2 text-[11px] text-sur-foret-mute">Accès réservé au rôle administrateur.</div>
      </aside>

      <div className="min-w-0 flex-1 bg-page">
        <header className="flex items-center justify-between border-b border-bordure bg-carte px-5 py-3.5 md:px-8">
          <h1 className="text-base font-medium text-principal">{onglet}</h1>
          <span className="flex items-center gap-1.5 text-xs text-secondaire">{Ping} {enLigne} en ligne</span>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-bordure bg-carte px-4 py-2 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => setOnglet(n.label)}
              className={
                "shrink-0 rounded-pill px-3 py-1.5 text-xs " +
                (onglet === n.label ? "bg-feuille text-sur-vert" : "border border-bordure text-secondaire")
              }
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-5 md:px-8">
          {onglet === "Tableau de bord" && (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-carte border border-bordure bg-carte p-4">
                    <div className="flex items-center gap-1.5">
                      <s.icon className="h-5 w-5 text-action-verte" strokeWidth={1.75} />
                      {s.live && Ping}
                    </div>
                    <div className="mt-2 text-lg font-medium text-principal">{s.valeur}</div>
                    <div className="text-[11px] text-secondaire">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                {AnnoncesSection}
                {SignalementsSection}
              </div>
              <div className="mt-5">{VerifsSection}</div>
            </>
          )}

          {onglet === "Utilisateurs" && (
            <>
              {EnLigneBanner}
              {UsersSection}
            </>
          )}

          {onglet === "Annonces" && (
            <div className="space-y-4">
              {AnnoncesSection}
              {ToutesAnnoncesSection}
            </div>
          )}

          {onglet === "Signalements" && (
            <div className="grid grid-cols-1 gap-5">
              {SignalementsSection}
              {VerifsSection}
            </div>
          )}

          {onglet === "Mots de passe" && DemandesResetSection}

          {onglet === "Parrainage" && (
            <div className="space-y-5">
              <section className="rounded-carte border border-bordure bg-carte p-4">
                <h2 className="mb-3 flex items-center gap-1.5 text-sm font-medium text-principal">
                  <Gift className="h-4 w-4 text-action-verte" /> Parrainages ({parrainages.length})
                </h2>
                {parrainages.length === 0 ? (
                  <p className="py-6 text-center text-sm text-tertiaire">Aucun parrainage pour le moment.</p>
                ) : (
                  <>
                    <div className="hidden grid-cols-12 gap-2 border-b border-bordure pb-2 text-[11px] font-medium text-secondaire sm:grid">
                      <span className="col-span-3">Parrain</span>
                      <span className="col-span-3">Filleul</span>
                      <span className="col-span-2">Date</span>
                      <span className="col-span-2">Statut</span>
                      <span className="col-span-2 text-right">Commissions</span>
                    </div>
                    <div className="max-h-[32rem] divide-y divide-bordure overflow-y-auto">
                      {parrainages.map((p) => (
                        <div key={p.id} className="grid grid-cols-2 gap-1 py-2.5 text-sm sm:grid-cols-12 sm:items-center sm:gap-2">
                          <span className="col-span-1 truncate font-medium text-principal sm:col-span-3">{p.parrain}</span>
                          <span className="col-span-1 truncate text-secondaire sm:col-span-3">→ {p.filleul}</span>
                          <span className="col-span-1 text-[11px] text-tertiaire sm:col-span-2">{p.date}</span>
                          <span className="col-span-1 sm:col-span-2">
                            <span className={"rounded-pill px-2 py-0.5 text-[10px] font-medium " + (p.statut === "Actif" ? "bg-tint-succes text-texte-succes" : "bg-pill-fond text-pill-texte")}>
                              {p.statut}
                            </span>
                          </span>
                          <span className="col-span-2 text-right text-principal sm:col-span-2">
                            {p.total} <span className="text-[11px] text-tertiaire">({p.nb})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-carte border border-bordure bg-carte p-4">
                <h2 className="mb-1 text-sm font-medium text-principal">Paramètres du parrainage</h2>
                <p className="mb-3 text-xs text-secondaire">Taux de commission et durée du programme.</p>
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-secondaire">Commission (%)</label>
                    <input type="number" value={taux} onChange={(e) => setTaux(Number(e.target.value))} className="w-28 rounded-champ border border-bordure bg-carte px-3 py-2 text-sm outline-none focus:border-feuille" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-secondaire">Durée (mois)</label>
                    <input type="number" value={duree} onChange={(e) => setDuree(Number(e.target.value))} className="w-28 rounded-champ border border-bordure bg-carte px-3 py-2 text-sm outline-none focus:border-feuille" />
                  </div>
                  <button onClick={sauverParrainage} disabled={savingParr} className="rounded-champ bg-feuille px-5 py-2 text-sm font-medium text-sur-vert disabled:opacity-60">
                    {savingParr ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-tertiaire">Appliqué : {taux}% sur chaque recharge des filleuls, pendant {duree} mois. Le nouveau taux s'applique immédiatement ; la durée s'applique aux nouveaux filleuls.</p>
              </section>

              <section className="rounded-carte border border-bordure bg-carte p-4">
                <h2 className="text-sm font-medium text-principal">Tarifs des mises en avant (par jour)</h2>
                <p className="mt-1 text-xs text-secondaire">Prix en FCFA facturés par jour pour chaque niveau de mise en avant. Le nouveau tarif s'applique immédiatement aux prochains achats.</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(["URGENT", "TOP", "VIP", "PREMIUM"] as const).map((n) => (
                    <div key={n}>
                      <label className="mb-1 block text-xs text-secondaire">{n}</label>
                      <input
                        type="number"
                        min={0}
                        value={tarifs[n]}
                        onChange={(e) => setTarifs((t) => ({ ...t, [n]: Number(e.target.value) }))}
                        className="w-full rounded-champ border border-bordure bg-carte px-3 py-2 text-sm outline-none focus:border-feuille"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={sauverTarifs} disabled={savingTarifs} className="mt-4 rounded-champ bg-feuille px-5 py-2 text-sm font-medium text-sur-vert disabled:opacity-60">
                  {savingTarifs ? "Enregistrement…" : "Enregistrer les tarifs"}
                </button>
              </section>
            </div>
          )}

          {onglet === "Pages légales" && (
            <div className="space-y-4">
              <p className="text-sm text-secondaire">
                Modifiez le contenu des pages légales du site. Les changements sont visibles immédiatement.
              </p>
              {contenus.map((c) => (
                <ContenuEditor key={c.cle} cle={c.cle} titre={c.titre} corps={c.corps} enregistrer={enregistrerContenuPage} />
              ))}
            </div>
          )}

          {onglet === "Apparence" && (
            <div className="max-w-md space-y-4">
              <section className="rounded-carte border border-bordure bg-carte p-4">
                <h2 className="mb-1 text-sm font-medium text-principal">Logo du site</h2>
                <p className="mb-3 text-xs text-secondaire">
                  Affiché dans l'en-tête et le back-office. PNG conseillé (fond transparent). Max ~2 Mo.
                </p>
                <div className="mb-3 flex items-center justify-center rounded-petit bg-foret-fonce p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview ?? "/logo"} alt="Logo" className="h-12" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-champ border border-feuille px-4 py-2 text-sm font-medium text-action-verte">
                    Choisir une image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) choisirLogo(f); e.target.value = ""; }}
                    />
                  </label>
                  {logoPreview && (
                    <button onClick={sauverLogo} disabled={savingLogo} className="rounded-champ bg-feuille px-4 py-2 text-sm font-medium text-sur-vert disabled:opacity-60">
                      {savingLogo ? "Enregistrement…" : "Enregistrer le logo"}
                    </button>
                  )}
                  <button onClick={resetLogo} className="rounded-champ border border-bordure px-4 py-2 text-sm font-medium text-principal">
                    Réinitialiser
                  </button>
                </div>
                {logoPreview && (
                  <p className="mt-2 text-[11px] text-tertiaire">Aperçu non enregistré — cliquez sur « Enregistrer le logo ».</p>
                )}
              </section>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-action-verte">← Retour au site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
