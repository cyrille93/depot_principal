"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Phone, IdCard, ScanFace, Check, Clock, Upload, MessageCircle, BadgeCheck } from "lucide-react";
import { envoyerCodeTelephone, confirmerTelephone, soumettrePiece, ouvrirChatVerification } from "@/app/actions/verification";
import { useToast } from "@/components/Toast";
import type { StatutVerif } from "@/lib/verification";

async function compresser(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1400;
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.85);
}

function Pastille({ etat }: { etat: "ok" | "attente" | "non" }) {
  if (etat === "ok")
    return (
      <span className="flex items-center gap-1 rounded-pill bg-tint-succes px-2.5 py-1 text-[11px] font-medium text-texte-succes">
        <Check className="h-3.5 w-3.5" /> Vérifié
      </span>
    );
  if (etat === "attente")
    return (
      <span className="flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-medium" style={{ background: "#FBEFD6", color: "#8A5A12" }}>
        <Clock className="h-3.5 w-3.5" /> En attente
      </span>
    );
  return (
    <span className="rounded-pill bg-pill-fond px-2.5 py-1 text-[11px] font-medium text-pill-texte">Non vérifié</span>
  );
}

export function VerificationClient({ statut }: { statut: StatutVerif }) {
  const toast = useToast();

  // Téléphone
  const [tel, setTel] = useState(statut.telephone);
  const [etape, setEtape] = useState<"idle" | "code">("idle");
  const [demo, setDemo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // Pièces
  const [attenteId, setAttenteId] = useState(statut.attenteIdentite);
  const [attenteSelfie, setAttenteSelfie] = useState(statut.attenteSelfie);
  const refId = useRef<HTMLInputElement>(null);
  const refSelfie = useRef<HTMLInputElement>(null);

  // Chat admin (vérification payante)
  const [busyChat, setBusyChat] = useState(false);
  const ouvrirChat = async () => {
    setBusyChat(true);
    const res = await ouvrirChatVerification();
    // En cas de succès, l'action redirige vers la messagerie (pas de retour ici).
    if (res?.error) {
      setBusyChat(false);
      toast(res.error, "error");
    }
  };

  const recevoirCode = async () => {
    setBusy(true);
    const res = await envoyerCodeTelephone();
    setBusy(false);
    if (res.ok) {
      setEtape("code");
      setDemo(res.code ?? null);
    } else toast(res.error ?? "Erreur.", "error");
  };

  const validerCode = async () => {
    setBusy(true);
    const res = await confirmerTelephone(code);
    setBusy(false);
    if (res.ok) {
      setTel(true);
      setEtape("idle");
      toast("Téléphone vérifié !", "success");
    } else toast(res.error ?? "Code incorrect.", "error");
  };

  const uploader = async (type: "IDENTITE" | "SELFIE", f?: File) => {
    if (!f) return;
    try {
      const data = await compresser(f);
      const res = await soumettrePiece(type, data);
      if (res.ok) {
        if (type === "IDENTITE") setAttenteId(true);
        else setAttenteSelfie(true);
        toast("Document envoyé — en attente de validation.", "success");
      } else toast(res.error ?? "Erreur.", "error");
    } catch {
      toast("Image illisible.", "error");
    }
  };

  const niveau = (tel ? 1 : 0) + (statut.identite ? 1 : 0) + (statut.selfie ? 1 : 0);

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4">
        <Link href="/compte" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Mon compte
        </Link>
      </div>

      <h1 className="flex items-center gap-2 text-xl font-medium text-principal">
        <ShieldCheck className="h-5 w-5 text-feuille" /> Vérification du profil
      </h1>
      <p className="mt-1 text-sm text-secondaire">
        Un profil vérifié inspire confiance et ressort mieux dans les résultats.
        {niveau > 0 && <span className="ml-1 text-texte-succes">Niveau {niveau}/3.</span>}
      </p>

      {/* Vérification de compte payante via le chat admin */}
      <section className="mt-5 rounded-carte border border-feuille bg-tint-succes p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-texte-succes">
            <BadgeCheck className="h-4 w-4" /> Badge vérifié
          </span>
          <span className="rounded-pill bg-carte px-2.5 py-1 text-[12px] font-medium text-principal">10 000 FCFA</span>
        </div>
        <p className="mt-2 text-[13px] text-texte-succes">
          La vérification du compte (pièce d'identité + selfie) est payante. Pour la régler et finaliser,
          ouvrez une discussion avec l'administration : vous y enverrez vos documents et conviendrez du paiement.
        </p>
        <button
          onClick={ouvrirChat}
          disabled={busyChat}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          <MessageCircle className="h-4 w-4" /> {busyChat ? "Ouverture…" : "Ouvrir le chat admin"}
        </button>
      </section>

      {/* Téléphone */}
      <section className="mt-5 rounded-carte border border-bordure bg-carte p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-principal">
            <Phone className="h-4 w-4 text-action-verte" /> Téléphone
          </span>
          <Pastille etat={tel ? "ok" : "non"} />
        </div>
        {!tel && etape === "idle" && (
          <button
            onClick={recevoirCode}
            disabled={busy}
            className="mt-3 w-full rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
          >
            Recevoir un code par SMS
          </button>
        )}
        {!tel && etape === "code" && (
          <div className="mt-3">
            {demo && (
              <p className="mb-2 rounded-champ bg-surface-neutre px-3 py-2 text-[12px] text-secondaire">
                Démo (pas de vrai SMS en développement) — code : <b className="text-principal">{demo}</b>
              </p>
            )}
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                placeholder="Code à 4 chiffres"
                className="flex-1 rounded-champ border border-bordure px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              />
              <button
                onClick={validerCode}
                disabled={busy}
                className="rounded-champ bg-feuille px-4 py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
              >
                Valider
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Identité */}
      <section className="mt-3 rounded-carte border border-bordure bg-carte p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-principal">
            <IdCard className="h-4 w-4 text-action-verte" /> Pièce d'identité
          </span>
          <Pastille etat={statut.identite ? "ok" : attenteId ? "attente" : "non"} />
        </div>
        <p className="mt-1 text-xs text-secondaire">Photo recto d'une pièce officielle (CNI, passeport).</p>
        {!statut.identite && !attenteId && (
          <>
            <button
              onClick={() => refId.current?.click()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-champ border border-feuille py-2.5 text-sm font-medium text-action-verte"
            >
              <Upload className="h-4 w-4" /> Envoyer ma pièce
            </button>
            <input
              ref={refId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploader("IDENTITE", e.target.files?.[0])}
            />
          </>
        )}
      </section>

      {/* Selfie */}
      <section className="mt-3 rounded-carte border border-bordure bg-carte p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-principal">
            <ScanFace className="h-4 w-4 text-action-verte" /> Selfie
          </span>
          <Pastille etat={statut.selfie ? "ok" : attenteSelfie ? "attente" : "non"} />
        </div>
        <p className="mt-1 text-xs text-secondaire">Un selfie net, comparé à votre pièce d'identité.</p>
        {!statut.selfie && !attenteSelfie && (
          <>
            <button
              onClick={() => refSelfie.current?.click()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-champ border border-feuille py-2.5 text-sm font-medium text-action-verte"
            >
              <Upload className="h-4 w-4" /> Envoyer mon selfie
            </button>
            <input
              ref={refSelfie}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploader("SELFIE", e.target.files?.[0])}
            />
          </>
        )}
      </section>

      <p className="mt-4 text-center text-[11px] text-tertiaire">
        Vos documents ne sont visibles que par l'équipe de modération.
      </p>
    </main>
  );
}
