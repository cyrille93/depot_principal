"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Share2,
  BadgeCheck,
  Star,
  Heart,
  MessageCircle,
  Timer,
  CalendarDays,
  Phone,
  FileCheck,
  ScanFace,
  EyeOff,
  MapPin,
  Check,
} from "lucide-react";
import type { ProfilDetail } from "@/lib/mock";
import type { MonAvis } from "@/lib/annonces";
import { AvisForm } from "@/components/AvisForm";
import { SignalerModal } from "@/components/SignalerModal";
import { demarrerConversation } from "@/app/actions/messages";
import { useToast } from "@/components/Toast";

function Etoiles({ note, size = 14 }: { note: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(note) ? "text-etoile" : "text-bordure-forte"}
          fill={i <= Math.round(note) ? "#E0A024" : "#DCE3D7"}
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

function LigneVerif({
  ok,
  label,
  Icon,
}: {
  ok: boolean;
  label: string;
  Icon: typeof Phone;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-2 text-principal">
        <Icon className="h-[18px] w-[18px] text-secondaire" strokeWidth={1.75} />
        {label}
      </span>
      {ok ? (
        <span className="flex items-center gap-1 text-texte-succes">
          <Check className="h-4 w-4" strokeWidth={2.5} /> vérifié
        </span>
      ) : (
        <span className="text-tertiaire">non vérifié</span>
      )}
    </div>
  );
}

function CarteAction({ p }: { p: ProfilDetail }) {
  const [favori, setFavori] = useState(false);
  const toast = useToast();
  const dispo = p.statut === "Disponible";

  // Lien WhatsApp : on nettoie le numéro et on préfixe l'indicatif Cameroun (237) si besoin
  const lienWa = (() => {
    let n = (p.telephoneContact ?? "").replace(/\D/g, "");
    if (!n) return null;
    if (n.startsWith("00")) n = n.slice(2);
    if (n.startsWith("0")) n = n.slice(1);
    if (!n.startsWith("237") && n.length <= 9) n = "237" + n;
    const texte = encodeURIComponent(`Bonjour, je vous contacte via Rose Annonce au sujet de votre annonce (${p.pseudo}).`);
    return `https://wa.me/${n}?text=${texte}`;
  })();

  const contacter = async () => {
    const res = await demarrerConversation(p.id);
    if (res?.error) toast(res.error, "error");
  };

  return (
    <div className="rounded-carte border border-bordure bg-carte p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-medium text-principal">
          {p.note.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
        </span>
        <Etoiles note={p.note} />
        <span className="text-sm text-secondaire">({p.avis} avis)</span>
      </div>

      <div className="mt-3 text-sm text-secondaire">
        {p.prix > 0 ? (
          <>
            À partir de{" "}
            <span className="text-base font-medium text-principal">
              {p.prix.toLocaleString("fr-FR")} F
            </span>
          </>
        ) : (
          <span className="text-base font-medium text-principal">Prix à convenir</span>
        )}
      </div>

      <span
        className={
          dispo
            ? "mt-3 inline-block rounded-pill bg-tint-succes px-3 py-1 text-xs text-texte-succes"
            : "mt-3 inline-block rounded-pill bg-pill-fond px-3 py-1 text-xs text-pill-texte"
        }
      >
        {p.statut}
      </span>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={contacter} className="flex items-center justify-center gap-2 rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert">
          <MessageCircle className="h-[18px] w-[18px]" /> Écrire ici
        </button>
        {lienWa ? (
          <a
            href={lienWa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-champ py-3 text-sm font-medium"
            style={{ backgroundColor: "#25D366", color: "#0B2A18" }}
          >
            <Phone className="h-[18px] w-[18px]" /> WhatsApp
          </a>
        ) : (
          <span className="flex items-center justify-center gap-2 rounded-champ bg-surface-neutre py-3 text-sm font-medium text-tertiaire">
            <Phone className="h-[18px] w-[18px]" /> WhatsApp
          </span>
        )}
      </div>
      {lienWa && p.telephoneContact && (
        <a href={lienWa} target="_blank" rel="noopener noreferrer" className="mt-2 block text-center text-xs text-action-verte">
          ou continuez sur WhatsApp : {p.telephoneContact}
        </a>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setFavori((v) => !v)}
          className="flex flex-1 items-center justify-center gap-2 rounded-champ border border-bordure py-2.5 text-sm text-principal"
        >
          <Heart className="h-4 w-4 text-feuille" fill={favori ? "#1EA85B" : "transparent"} />
          {favori ? "En favori" : "Favori"}
        </button>
        <SignalerModal
          cibleType="ANNONCE"
          cibleId={p.id}
          label="Signaler"
          className="flex items-center justify-center gap-2 rounded-champ border border-bordure px-3 py-2.5 text-sm text-secondaire"
        />
      </div>

      <div className="mt-4 border-t border-bordure pt-3">
        <LigneVerif ok={p.verif.telephone} label="Téléphone" Icon={Phone} />
        <LigneVerif ok={p.verif.identite} label="Identité" Icon={FileCheck} />
        <LigneVerif ok={p.verif.selfie} label="Selfie" Icon={ScanFace} />
      </div>
    </div>
  );
}

export function FicheProfil({
  profil: p,
  peutEvaluer = false,
  monAvis = null,
}: {
  profil: ProfilDetail;
  peutEvaluer?: boolean;
  monAvis?: MonAvis | null;
}) {
  const [actif, setActif] = useState(0);
  const medias = p.medias && p.medias.length > 0 ? p.medias : [{ url: "", floutee: true }];
  const estImg = (u?: string) => !!u && (u.startsWith("data:") || u.startsWith("http"));
  const courant = medias[actif] ?? medias[0];

  return (
    <main className="mx-auto max-w-5xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Retour
        </Link>
        <div className="flex items-center gap-4 text-secondaire">
          <button aria-label="Partager"><Share2 className="h-5 w-5" /></button>
          <SignalerModal cibleType="ANNONCE" cibleId={p.id} label="" className="text-secondaire" />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-6">
        {/* Colonne principale */}
        <div>
          {/* Galerie */}
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-carte bg-media sm:aspect-[16/10]">
            {estImg(courant.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={courant.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-tertiaire">
                <EyeOff className="h-10 w-10" strokeWidth={1.4} />
                <span className="mt-1.5 text-xs">visage flouté</span>
              </div>
            )}
            {courant.floutee && estImg(courant.url) && (
              <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-pill bg-carte/90 px-2.5 py-1 text-[11px] text-texte-succes">
                <EyeOff className="h-3.5 w-3.5" /> Visage flouté
              </span>
            )}
            {p.enLigne && (
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-pill bg-carte/90 px-2.5 py-1 text-xs text-texte-succes">
                <span className="h-2 w-2 rounded-pill bg-feuille-clair" /> En ligne
              </span>
            )}
            {p.badge && (
              <span
                className={
                  p.badge === "VIP"
                    ? "absolute right-3 top-3 rounded-pill bg-vip px-2.5 py-1 text-xs font-medium text-white"
                    : "absolute right-3 top-3 rounded-pill bg-feuille px-2.5 py-1 text-xs font-medium text-sur-vert"
                }
              >
                {p.badge}
              </span>
            )}
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto">
            {medias.map((m, i) => (
              <button
                key={i}
                onClick={() => setActif(i)}
                className={
                  "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-petit bg-media " +
                  (actif === i ? "ring-2 ring-feuille" : "border border-bordure")
                }
                aria-label={`Média ${i + 1}`}
              >
                {estImg(m.url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <EyeOff className="h-4 w-4 text-tertiaire" strokeWidth={1.5} />
                )}
              </button>
            ))}
          </div>

          {/* En-tête identité */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-medium text-principal">{p.pseudo}</h1>
              {p.verifie && <BadgeCheck className="h-5 w-5 text-feuille" />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-secondaire">
              <span className="rounded-pill bg-pill-fond px-2.5 py-0.5 text-xs text-pill-texte">
                {p.categorie}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {p.quartier}, {p.ville} · {p.distanceKm} km
              </span>
            </div>
          </div>

          {/* Carte action — version mobile */}
          <div className="mt-5 lg:hidden">
            <CarteAction p={p} />
          </div>

          {/* Réputation */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-carte border border-bordure bg-carte p-3 text-center">
              <Timer className="mx-auto h-5 w-5 text-action-verte" strokeWidth={1.75} />
              <div className="mt-1 text-sm font-medium text-principal">~{p.delaiReponseMin} min</div>
              <div className="text-[11px] text-secondaire">délai de réponse</div>
            </div>
            <div className="rounded-carte border border-bordure bg-carte p-3 text-center">
              <MessageCircle className="mx-auto h-5 w-5 text-action-verte" strokeWidth={1.75} />
              <div className="mt-1 text-sm font-medium text-principal">{p.tauxReponse}%</div>
              <div className="text-[11px] text-secondaire">taux de réponse</div>
            </div>
            <div className="rounded-carte border border-bordure bg-carte p-3 text-center">
              <CalendarDays className="mx-auto h-5 w-5 text-action-verte" strokeWidth={1.75} />
              <div className="mt-1 text-sm font-medium text-principal">{p.ancienneteMois} mois</div>
              <div className="text-[11px] text-secondaire">ancienneté</div>
            </div>
          </div>

          {/* Description */}
          <section className="mt-6">
            <h2 className="text-base font-medium text-principal">À propos</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondaire">{p.description}</p>
          </section>

          {/* Notation par critère */}
          <section className="mt-6">
            <h2 className="text-base font-medium text-principal">Notes par critère</h2>
            <div className="mt-3 space-y-2.5">
              {p.criteres.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm text-secondaire">{c.label}</span>
                  <div className="h-1.5 flex-1 rounded-pill bg-bordure">
                    <div
                      className="h-1.5 rounded-pill bg-feuille"
                      style={{ width: `${(c.note / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-medium text-principal">
                    {c.note.toLocaleString("fr-FR", { minimumFractionDigits: 1 })}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Avis */}
          <section className="mt-6">
            <h2 className="text-base font-medium text-principal">
              Avis ({p.avisListe.length})
            </h2>

            {peutEvaluer && <AvisForm annonceId={p.id} monAvis={monAvis} />}

            {p.avisListe.length === 0 ? (
              <p className="mt-3 rounded-carte border border-bordure bg-carte p-4 text-sm text-secondaire">
                Aucun avis pour le moment.{peutEvaluer ? " Soyez le premier à en laisser un." : ""}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {p.avisListe.map((a) => (
                  <div key={a.id} className="rounded-carte border border-bordure bg-carte p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-foret text-xs font-medium text-tint-succes">
                          {a.auteur.charAt(0)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-principal">{a.auteur}</div>
                          <div className="text-[11px] text-tertiaire">{a.date}</div>
                        </div>
                      </div>
                      <Etoiles note={a.note} size={13} />
                    </div>
                    <span className="mt-2 inline-block rounded-pill bg-pill-fond px-2.5 py-0.5 text-[11px] text-pill-texte">
                      {a.critere}
                    </span>
                    <p className="mt-2 text-sm text-secondaire">{a.commentaire}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Carte action — version desktop (sticky) */}
        <aside className="hidden lg:sticky lg:top-6 lg:block">
          <CarteAction p={p} />
        </aside>
      </div>
    </main>
  );
}
