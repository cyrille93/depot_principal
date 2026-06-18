"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImagePlus, EyeOff, ShieldAlert, Check, CircleAlert } from "lucide-react";
import { FloutageEditor } from "@/components/FloutageEditor";
import { creerAnnonce, type AnnonceState } from "@/app/actions/annonces";
import { useToast } from "@/components/Toast";

const CATS = [
  { v: "RENCONTRE", l: "Rencontre" },
  { v: "MASSAGE", l: "Massage" },
  { v: "SPA", l: "Spa" },
  { v: "PRODUITS", l: "Produits adultes" },
];

type Media = { id: string; floutes: number; src?: string };
let mseq = 0;

export function PublierForm({ villes }: { villes: { id: string; nom: string }[] }) {
  const [medias, setMedias] = useState<Media[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [state, action, pending] = useActionState<AnnonceState, FormData>(creerAnnonce, {});
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast(state.error, "error");
    if (state.ok) toast("Annonce envoyée — elle passe en modération.", "success");
  }, [state, toast]);

  const ouvrirSelecteur = () => fileRef.current?.click();

  // Compresse l'image (redimensionne + JPEG) pour un aperçu rapide et un envoi léger
  const compresser = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1280;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width >= height) {
              height = Math.round((height * MAX) / width);
              width = MAX;
            } else {
              width = Math.round((width * MAX) / height);
              height = MAX;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("canvas"));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = reject;
        img.src = String(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onFichiers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const restant = 10 - medias.length;
    if (restant <= 0) {
      toast("Maximum 10 photos par annonce.", "error");
      e.target.value = "";
      return;
    }
    if (files.length > restant) toast(`Vous pouvez ajouter ${restant} photo(s) de plus (10 max).`, "info");
    for (const f of files.slice(0, restant)) {
      try {
        const src = await compresser(f);
        setMedias((m) => (m.length >= 10 ? m : [...m, { id: `m${mseq++}`, floutes: 0, src }]));
      } catch {
        toast("Image illisible, réessayez avec une autre.", "error");
      }
    }
    e.target.value = "";
  };

  const enEdition = medias.find((m) => m.id === editId) ?? null;
  const enregistrerFloutage = (result: { count: number; src?: string }) => {
    setMedias((m) => m.map((x) => (x.id === editId ? { ...x, floutes: result.count, src: result.src ?? x.src } : x)));
    setEditId(null);
  };

  if (state.ok) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-pill bg-tint-succes text-texte-succes">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h1 className="mt-4 text-xl font-medium text-principal">Annonce envoyée</h1>
        <p className="mt-2 text-sm text-secondaire">
          Elle passe en modération (contrôle anti-mineurs et conformité) avant publication.
          Vous serez notifié dès sa mise en ligne.
        </p>
        <Link href="/" className="mt-6 rounded-champ bg-feuille px-5 py-2.5 text-sm font-medium text-sur-vert">
          Retour à l'accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-5">
      <div className="mb-4 flex items-center gap-1">
        <Link href="/" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Retour
        </Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Publier une annonce</h1>

      <form action={action} className="mt-5 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-principal">Titre <span className="text-vip">*</span></label>
          <input
            name="titre"
            required
            className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm outline-none focus:border-feuille"
            placeholder="Ex : Massage relaxant à Akwa"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Description <span className="text-vip">*</span></label>
          <textarea
            name="description"
            required
            rows={4}
            className="w-full resize-none rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm outline-none focus:border-feuille"
            placeholder="Décrivez votre prestation, le cadre, les conditions…"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-principal">Catégorie <span className="text-vip">*</span></label>
            <select name="categorie" className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm outline-none focus:border-feuille">
              {CATS.map((c) => (
                <option key={c.v} value={c.v}>{c.l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-principal">Ville <span className="text-vip">*</span></label>
            <select name="villeId" className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm outline-none focus:border-feuille">
              {villes.map((v) => (
                <option key={v.id} value={v.id}>{v.nom}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Tarif (FCFA) <span className="text-tertiaire">(optionnel)</span></label>
          <input
            name="prix"
            type="number"
            min={0}
            className="w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm outline-none focus:border-feuille"
            placeholder="Laisser vide pour « à convenir »"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">
            Photos <span className="text-tertiaire">({medias.length}/10)</span>
          </label>
          <p className="mb-2 flex items-center gap-1.5 text-xs text-secondaire">
            <ShieldAlert className="h-4 w-4 text-action-verte" /> Le floutage est optionnel : touchez une photo pour masquer le visage ou une partie du corps.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {medias.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setEditId(m.id)}
                className="relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-petit bg-media text-tertiaire"
              >
                {m.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                )}
                <span
                  className={
                    "absolute bottom-1 left-1 right-1 rounded-pill px-1.5 py-0.5 text-[10px] " +
                    (m.floutes > 0 ? "bg-tint-succes text-texte-succes" : "bg-pill-fond text-pill-texte")
                  }
                >
                  {m.floutes > 0 ? `${m.floutes} flouté(s)` : "Net · flouter ?"}
                </span>
              </button>
            ))}
            {medias.length < 10 && (
              <button
                type="button"
                onClick={ouvrirSelecteur}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-petit border border-dashed border-bordure-forte text-secondaire"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px]">Ajouter</span>
              </button>
            )}
          </div>
          {medias.length >= 10 && (
            <p className="mt-1 text-[11px] text-tertiaire">Limite de 10 photos atteinte.</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFichiers}
            className="hidden"
          />
        </div>

        <input type="hidden" name="medias" value={JSON.stringify(medias.map((m) => ({ floutes: m.floutes, src: m.src })))} />

        {state.error && (
          <p className="flex items-center gap-1.5 text-sm text-vip" role="alert">
            <CircleAlert className="h-4 w-4" /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          {pending ? "Publication…" : "Publier l'annonce"}
        </button>
      </form>

      {enEdition && (
        <FloutageEditor
          initial={enEdition.floutes}
          image={enEdition.src}
          onClose={() => setEditId(null)}
          onSave={enregistrerFloutage}
        />
      )}
    </main>
  );
}
