"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImagePlus, Send, X, Ban } from "lucide-react";
import { envoyerMessage, chargerFil, bloquer, debloquer } from "@/app/actions/messages";
import { useToast } from "@/components/Toast";
import { SignalerModal } from "@/components/SignalerModal";
import type { MessageUI } from "@/lib/messages";

async function compresser(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

function heure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function ConversationClient({
  conversationId,
  autreId,
  autrePseudo,
  annonceTitre,
  initial,
  jeBloque,
  ilMeBloque,
  autreEstAdmin = false,
}: {
  conversationId: string;
  autreId: string;
  autrePseudo: string;
  annonceTitre: string | null;
  initial: MessageUI[];
  jeBloque: boolean;
  ilMeBloque: boolean;
  autreEstAdmin?: boolean;
}) {
  const toast = useToast();
  const [messages, setMessages] = useState<MessageUI[]>(initial);
  const [texte, setTexte] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [bloque, setBloque] = useState(autreEstAdmin ? false : jeBloque);
  const fileRef = useRef<HTMLInputElement>(null);
  const basRef = useRef<HTMLDivElement>(null);

  const verrouille = bloque || ilMeBloque;

  const basculerBlocage = async () => {
    if (bloque) {
      const r = await debloquer(autreId);
      if (r.ok) {
        setBloque(false);
        toast("Utilisateur débloqué.", "success");
      } else toast(r.error ?? "Erreur.", "error");
    } else {
      const r = await bloquer(autreId);
      if (r.ok) {
        setBloque(true);
        toast("Utilisateur bloqué. Il ne pourra plus vous écrire.", "success");
      } else toast(r.error ?? "Erreur.", "error");
    }
  };

  const rafraichir = useCallback(async () => {
    const res = await chargerFil(conversationId);
    if (!res.error) setMessages(res.messages);
  }, [conversationId]);

  // Polling léger toutes les 4 s
  useEffect(() => {
    const t = setInterval(rafraichir, 4000);
    return () => clearInterval(t);
  }, [rafraichir]);

  // Défilement vers le bas
  useEffect(() => {
    basRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const choisirImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      setImg(await compresser(f));
    } catch {
      toast("Image illisible.", "error");
    }
  };

  const envoyer = async () => {
    if (verrouille) return;
    const tx = texte.trim();
    const im = img;
    if (!tx && !im) return;
    setEnvoi(true);

    const opt: MessageUI[] = [];
    const now = new Date().toISOString();
    if (im) opt.push({ id: `tmp-i-${Date.now()}`, mien: true, contenu: null, image: im, at: now });
    if (tx) opt.push({ id: `tmp-t-${Date.now()}`, mien: true, contenu: tx, image: null, at: now });
    setMessages((m) => [...m, ...opt]);
    setTexte("");
    setImg(null);

    let err: string | undefined;
    if (im) {
      const r = await envoyerMessage(conversationId, undefined, im);
      if (r.error) err = r.error;
    }
    if (tx) {
      const r = await envoyerMessage(conversationId, tx, undefined);
      if (r.error) err = r.error;
    }
    setEnvoi(false);
    if (err) toast(err, "error");
    rafraichir();
  };

  return (
    <main className="mx-auto flex h-[100dvh] max-w-2xl flex-col">
      {/* En-tête */}
      <header className="flex items-center gap-3 border-b border-bordure bg-carte px-4 py-3">
        <Link href="/messages" aria-label="Retour" className="text-secondaire">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-foret text-sm font-medium text-tint-succes">
          {autrePseudo.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-principal">{autrePseudo}</div>
          {annonceTitre && <div className="truncate text-[11px] text-secondaire">{annonceTitre}</div>}
        </div>
        {!autreEstAdmin && (
          <>
            <SignalerModal
              cibleType="PROFIL"
              cibleId={autreId}
              label=""
              sujet="cet utilisateur"
              className="flex h-9 w-9 items-center justify-center rounded-pill text-secondaire"
            />
            <button
              onClick={basculerBlocage}
              aria-label={bloque ? "Débloquer" : "Bloquer"}
              title={bloque ? "Débloquer" : "Bloquer"}
              className={"flex h-9 w-9 items-center justify-center rounded-pill " + (bloque ? "text-feuille" : "text-secondaire")}
            >
              <Ban className="h-[18px] w-[18px]" />
            </button>
          </>
        )}
      </header>

      {/* Fil */}
      <div className="flex-1 space-y-2 overflow-y-auto bg-page px-4 py-4">
        {messages.length === 0 && (
          <p className="mt-8 text-center text-sm text-secondaire">
            Démarrez la conversation en toute sécurité, sans quitter la plateforme.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={"group flex items-end gap-1 " + (m.mien ? "justify-end" : "justify-start")}>
            <div
              className={
                "max-w-[78%] rounded-carte px-3 py-2 " +
                (m.mien ? "bg-feuille text-sur-vert" : "border border-bordure bg-carte text-principal")
              }
            >
              {m.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.image} alt="" className="mb-1 max-h-60 rounded-petit object-cover" />
              )}
              {m.contenu && <p className="whitespace-pre-wrap text-sm">{m.contenu}</p>}
              <div className={"mt-0.5 text-[10px] " + (m.mien ? "text-sur-vert/70" : "text-tertiaire")}>
                {heure(m.at)}
              </div>
            </div>
            {!m.mien && !autreEstAdmin && (
              <SignalerModal
                cibleType="MESSAGE"
                cibleId={m.id}
                sujet="ce message"
                label=""
                className="mb-1 shrink-0 text-tertiaire opacity-60 transition hover:text-vip md:opacity-0 md:group-hover:opacity-100"
              />
            )}
          </div>
        ))}
        <div ref={basRef} />
      </div>

      {/* Saisie */}
      <div className="border-t border-bordure bg-carte px-3 py-2">
        {verrouille ? (
          <div className="flex items-center justify-center gap-2 py-2 text-center text-sm text-secondaire">
            <Ban className="h-4 w-4" />
            {bloque ? (
              <span>
                Vous avez bloqué cet utilisateur.{" "}
                <button onClick={basculerBlocage} className="font-medium text-action-verte">Débloquer</button>
              </span>
            ) : (
              <span>Vous ne pouvez plus envoyer de message dans cette conversation.</span>
            )}
          </div>
        ) : (
          <>
            {img && (
              <div className="relative mb-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-16 w-16 rounded-petit object-cover" />
                <button
                  onClick={() => setImg(null)}
                  aria-label="Retirer l'image"
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-pill bg-carte text-secondaire shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                aria-label="Joindre une image"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-action-verte"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={choisirImage} />
              <textarea
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    envoyer();
                  }
                }}
                rows={1}
                placeholder="Votre message…"
                className="max-h-28 flex-1 resize-none rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille"
              />
              <button
                onClick={envoyer}
                disabled={envoi || (!texte.trim() && !img)}
                aria-label="Envoyer"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-feuille text-sur-vert disabled:opacity-50"
              >
                <Send className="h-[18px] w-[18px]" />
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
