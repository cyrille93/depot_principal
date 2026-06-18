"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CircleAlert, ImagePlus, EyeOff, ShieldAlert, X } from "lucide-react";
import { FloutageEditor } from "@/components/FloutageEditor";
import { modifierAnnonce, type AnnonceState } from "@/app/actions/annonces";
import { useToast } from "@/components/Toast";

const CATS = [
  { v: "RENCONTRE", l: "Rencontre" },
  { v: "MASSAGE", l: "Massage" },
  { v: "SPA", l: "Spa" },
  { v: "PRODUITS", l: "Produits adultes" },
];

type Media = { id: string; floutes: number; src?: string };
let mseq = 0;

type Annonce = {
  id: string;
  titre: string;
  description: string;
  categorie: string;
  prix: number;
  villeId: string;
};

export function ModifierAnnonceForm({
  annonce,
  mediasInit,
  villes,
}: {
  annonce: Annonce;
  mediasInit: { src: string; floutes: number }[];
  villes: { id: string; nom: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [medias, setMedias] = useState<Media[]>(
    mediasInit.map((m) => ({ id: `m${mseq++}`, floutes: m.floutes, src: m.src }))
  );
  const [editId, setEditId] = useState<string | null>(null);
  const [state, action, pending] = useActionState<AnnonceState, FormData>(modifierAnnonce, {});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) toast(state.error, "error");
    if (state.ok) {
      toast("Annonce mise à jour.", "success");
      router.push("/compte");
    }
  }, [state, toast, router]);

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

  const retirer = (id: string) => setMedias((m) => m.filter((x) => x.id !== id));
  const estImg = (u?: string) => !!u && (u.startsWith("data:") || u.startsWith("http"));
  const enEdition = medias.find((m) => m.id === editId);

  const champ =
    "w-full rounded-champ border border-bordure bg-carte px-3 py-2.5 text-sm text-principal outline-none focus:border-feuille";

  return (
    <main className="mx-auto max-w-md px-4 py-5">
      <div className="mb-4">
        <Link href="/compte" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Mon compte
        </Link>
      </div>

      <h1 className="text-xl font-medium text-principal">Modifier l'annonce</h1>

      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={annonce.id} />

        <div>
          <label className="mb-1 block text-sm text-principal">Titre</label>
          <input name="titre" defaultValue={annonce.titre} className={champ} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Description</label>
          <textarea name="description" defaultValue={annonce.description} rows={4} className={champ} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Catégorie</label>
          <select name="categorie" defaultValue={annonce.categorie} className={champ}>
            {CATS.map((c) => (
              <option key={c.v} value={c.v}>{c.l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Ville</label>
          <select name="villeId" defaultValue={annonce.villeId} className={champ}>
            {villes.map((v) => (
              <option key={v.id} value={v.id}>{v.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-principal">Tarif (FCFA)</label>
          <input name="prix" type="number" defaultValue={annonce.prix} className={champ} />
        </div>

        {/* Photos */}
        <div>
          <label className="mb-1 block text-sm text-principal">
            Photos <span className="text-tertiaire">({medias.length}/10)</span>
          </label>
          <p className="mb-2 flex items-center gap-1.5 text-xs text-action-verte">
            <ShieldAlert className="h-4 w-4" /> Touchez une photo pour flouter le visage ou une partie du corps.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {medias.map((m) => (
              <div key={m.id} className="relative aspect-square overflow-hidden rounded-petit bg-media">
                <button
                  type="button"
                  onClick={() => setEditId(m.id)}
                  className="flex h-full w-full items-center justify-center text-tertiaire"
                >
                  {estImg(m.src) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.src} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                  )}
                  <span
                    className={
                      "absolute bottom-1 left-1 right-7 rounded-pill px-1.5 py-0.5 text-[10px] " +
                      (m.floutes > 0 ? "bg-tint-succes text-texte-succes" : "bg-vip/15 text-vip")
                    }
                  >
                    {m.floutes > 0 ? `${m.floutes} flouté(s)` : "à flouter"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => retirer(m.id)}
                  aria-label="Retirer la photo"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-pill bg-carte text-secondaire shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {medias.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-petit border border-dashed border-bordure-forte text-secondaire"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px]">Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFichiers} />
        </div>

        <input
          type="hidden"
          name="medias"
          value={JSON.stringify(medias.map((m) => ({ floutes: m.floutes, src: m.src })))}
        />

        {state.error && (
          <p className="flex items-center gap-1.5 text-sm text-vip">
            <CircleAlert className="h-4 w-4" /> {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-champ bg-feuille py-3 text-sm font-medium text-sur-vert disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </form>

      {enEdition && (
        <FloutageEditor
          initial={enEdition.floutes}
          image={estImg(enEdition.src) ? enEdition.src : undefined}
          onClose={() => setEditId(null)}
          onSave={(result) => {
            setMedias((m) => m.map((x) => (x.id === editId ? { ...x, floutes: result.count, src: result.src ?? x.src } : x)));
            setEditId(null);
          }}
        />
      )}
    </main>
  );
}
