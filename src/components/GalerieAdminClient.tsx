"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Video, X, Upload } from "lucide-react";
import { ajouterVideoGalerie, supprimerVideoGalerie } from "@/app/actions/galerie";
import { uploadVideoBlob } from "@/lib/blob-client";
import { useToast } from "@/components/Toast";

type VideoItem = { id: string; titre: string; description: string | null; url: string };

export function GalerieAdminClient({ videos }: { videos: VideoItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  const onVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadPct(0);
    const res = await uploadVideoBlob(file, (p) => setUploadPct(p));
    setUploadPct(null);
    if (res.ok && res.url) {
      setUrl(res.url);
      toast("Vidéo envoyée. Ajoutez un titre puis enregistrez.", "success");
    } else {
      toast(res.error ?? "Échec de l'envoi.", "error");
    }
  };

  const enregistrer = async () => {
    if (!url) {
      toast("Envoyez d'abord une vidéo.", "error");
      return;
    }
    setEnCours(true);
    const res = await ajouterVideoGalerie(titre, description, url);
    setEnCours(false);
    if (res.ok) {
      toast("Vidéo ajoutée à la galerie.", "success");
      setTitre("");
      setDescription("");
      setUrl("");
      router.refresh();
    } else {
      toast(res.error ?? "Erreur.", "error");
    }
  };

  const supprimer = async (id: string) => {
    const res = await supprimerVideoGalerie(id);
    if (res.ok) {
      toast("Vidéo supprimée.", "success");
      router.refresh();
    } else {
      toast(res.error ?? "Erreur.", "error");
    }
  };

  const champ = "w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille";

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-5">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-action-verte">
        <ChevronLeft className="h-4 w-4" /> Admin
      </Link>
      <h1 className="flex items-center gap-2 text-xl font-medium text-principal">
        <Video className="h-5 w-5 text-action-verte" /> Galerie vidéo
      </h1>
      <p className="mt-1 text-sm text-secondaire">Chargez des vidéos mises en avant sur l'accueil (100 Mo max par vidéo).</p>

      {/* Ajout */}
      <section className="mt-5 rounded-carte border border-bordure bg-carte p-4">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-principal">Vidéo</label>
            {url ? (
              <div className="relative overflow-hidden rounded-petit bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={url} controls className="h-40 w-full object-contain" />
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  aria-label="Retirer la vidéo"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-pill bg-carte text-secondaire shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : uploadPct !== null ? (
              <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-petit border border-dashed border-bordure-forte text-secondaire">
                <span className="text-xs">Envoi… {uploadPct}%</span>
                <span className="h-1.5 w-24 overflow-hidden rounded-pill bg-surface-neutre">
                  <span className="block h-full bg-feuille" style={{ width: `${uploadPct}%` }} />
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-petit border border-dashed border-bordure-forte text-secondaire"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">Choisir une vidéo</span>
              </button>
            )}
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={onVideo} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-principal">Titre</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} className={champ} placeholder="Titre de la vidéo" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-principal">Description <span className="text-tertiaire">(courte)</span></label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={champ} placeholder="Quelques mots…" />
          </div>

          <button
            onClick={enregistrer}
            disabled={enCours || !url}
            className="w-full rounded-champ bg-feuille py-2.5 text-sm font-medium text-sur-vert disabled:opacity-60"
          >
            {enCours ? "Enregistrement…" : "Ajouter à la galerie"}
          </button>
        </div>
      </section>

      {/* Liste existante */}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-principal">Vidéos en ligne ({videos.length})</h2>
        {videos.length === 0 ? (
          <p className="mt-2 text-sm text-secondaire">Aucune vidéo pour le moment.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {videos.map((v) => (
              <div key={v.id} className="overflow-hidden rounded-carte border border-bordure bg-carte">
                <div className="aspect-video bg-black">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video src={v.url} controls preload="metadata" className="h-full w-full object-contain" />
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-principal">{v.titre}</p>
                    {v.description && <p className="mt-0.5 line-clamp-2 text-xs text-secondaire">{v.description}</p>}
                  </div>
                  <button
                    onClick={() => supprimer(v.id)}
                    className="shrink-0 rounded-champ border border-bordure px-2.5 py-1 text-xs text-vip hover:border-vip"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
