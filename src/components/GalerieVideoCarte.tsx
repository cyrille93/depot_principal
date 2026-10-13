"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, Heart, MessageCircle, Trash2, Send } from "lucide-react";
import {
  enregistrerVueVideo,
  basculerLikeVideo,
  ajouterCommentaireVideo,
  supprimerCommentaireVideo,
} from "@/app/actions/galerie";
import { useToast } from "@/components/Toast";

export type CommentaireVue = {
  id: string;
  contenu: string;
  auteur: string;
  date: string;
  peutSupprimer: boolean;
};

export type VideoGalerieVue = {
  id: string;
  titre: string;
  description: string | null;
  url: string;
  vues: number;
  nbLikes: number;
  nbCommentaires: number;
  aime: boolean;
  commentaires: CommentaireVue[];
};

export function GalerieVideoCarte({
  video,
  estConnecte,
}: {
  video: VideoGalerieVue;
  estConnecte: boolean;
}) {
  const toast = useToast();
  const [vues, setVues] = useState(video.vues);
  const [aime, setAime] = useState(video.aime);
  const [nbLikes, setNbLikes] = useState(video.nbLikes);
  const [nbComm, setNbComm] = useState(video.nbCommentaires);
  const [commentaires, setCommentaires] = useState<CommentaireVue[]>(video.commentaires);
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const vueComptee = useRef(false);

  // Compte une vue au lancement de la lecture, une seule fois par session.
  const onPlay = async () => {
    if (vueComptee.current) return;
    vueComptee.current = true;
    const cle = `vg_vue_${video.id}`;
    try {
      if (sessionStorage.getItem(cle)) return;
      sessionStorage.setItem(cle, "1");
    } catch {
      /* mode privé : on compte quand même une fois via le garde mémoire */
    }
    setVues((n) => n + 1); // optimiste
    await enregistrerVueVideo(video.id).catch(() => {});
  };

  const onLike = async () => {
    if (!estConnecte) {
      toast("Connectez-vous pour aimer une vidéo.", "error");
      return;
    }
    const cible = !aime;
    setAime(cible);
    setNbLikes((n) => Math.max(0, n + (cible ? 1 : -1))); // optimiste
    const res = await basculerLikeVideo(video.id);
    if (res.error) {
      setAime(!cible);
      setNbLikes((n) => Math.max(0, n + (cible ? -1 : 1)));
      toast(res.error, "error");
    } else if (typeof res.total === "number") {
      setAime(!!res.aime);
      setNbLikes(res.total);
    }
  };

  const publier = async () => {
    const t = texte.trim();
    if (!t) return;
    setEnvoi(true);
    const res = await ajouterCommentaireVideo(video.id, t);
    setEnvoi(false);
    if (res.ok && res.commentaire) {
      setCommentaires((list) => [{ ...res.commentaire!, peutSupprimer: true }, ...list]);
      setNbComm((n) => n + 1);
      setTexte("");
    } else {
      toast(res.error ?? "Erreur lors de l'envoi.", "error");
    }
  };

  const supprimer = async (id: string) => {
    const res = await supprimerCommentaireVideo(id);
    if (res.ok) {
      setCommentaires((list) => list.filter((c) => c.id !== id));
      setNbComm((n) => Math.max(0, n - 1));
    } else {
      toast(res.error ?? "Erreur.", "error");
    }
  };

  const bloquer = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div className="overflow-hidden rounded-carte border border-bordure bg-carte">
      {/* Lecteur : mesures anti-téléchargement (dissuasion) */}
      <div className="aspect-video bg-black" onContextMenu={bloquer}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={video.url}
          controls
          preload="metadata"
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          onContextMenu={bloquer}
          onDragStart={bloquer}
          onPlay={onPlay}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="p-3">
        <h2 className="text-sm font-medium text-principal">{video.titre}</h2>
        {video.description && <p className="mt-1 text-xs text-secondaire">{video.description}</p>}

        {/* Statistiques + actions */}
        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-secondaire">
            <Eye className="h-4 w-4" /> {vues}
          </span>
          <button
            onClick={onLike}
            aria-pressed={aime}
            className={"flex items-center gap-1 " + (aime ? "text-feuille" : "text-secondaire")}
          >
            <Heart className={"h-4 w-4 " + (aime ? "fill-current" : "")} /> {nbLikes}
          </button>
          <button
            onClick={() => setOuvert((o) => !o)}
            className={"flex items-center gap-1 " + (ouvert ? "text-action-verte" : "text-secondaire")}
          >
            <MessageCircle className="h-4 w-4" /> {nbComm}
          </button>
        </div>

        {/* Commentaires (repliable) */}
        {ouvert && (
          <div className="mt-3 border-t border-bordure pt-3">
            {estConnecte ? (
              <div className="flex items-start gap-2">
                <textarea
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  placeholder="Votre commentaire…"
                  className="min-w-0 flex-1 rounded-champ border border-bordure bg-carte px-2.5 py-1.5 text-xs text-principal outline-none focus:border-feuille"
                />
                <button
                  onClick={publier}
                  disabled={envoi || !texte.trim()}
                  aria-label="Publier le commentaire"
                  className="shrink-0 rounded-champ bg-feuille p-2 text-sur-vert disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-secondaire">
                <Link href="/connexion" className="text-action-verte">
                  Connectez-vous
                </Link>{" "}
                pour aimer et commenter.
              </p>
            )}

            <div className="mt-3 space-y-3">
              {commentaires.length === 0 ? (
                <p className="text-xs text-tertiaire">Aucun commentaire pour le moment.</p>
              ) : (
                commentaires.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs">
                        <span className="font-medium text-principal">{c.auteur}</span>{" "}
                        <span className="text-tertiaire">· {c.date}</span>
                      </p>
                      <p className="mt-0.5 break-words text-xs text-secondaire">{c.contenu}</p>
                    </div>
                    {c.peutSupprimer && (
                      <button
                        onClick={() => supprimer(c.id)}
                        aria-label="Supprimer le commentaire"
                        className="shrink-0 text-tertiaire hover:text-vip"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
