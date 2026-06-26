"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Star, Heart, BadgeCheck, MapPin } from "lucide-react";
import type { ProfilFictif } from "@/lib/mock";
import { toggleFavori } from "@/app/actions/favoris";
import { useToast } from "@/components/Toast";

export function ProfilCard({ profil }: { profil: ProfilFictif }) {
  const [favori, setFavori] = useState(!!profil.favori);
  const toast = useToast();

  const onCoeur = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cible = !favori;
    setFavori(cible); // optimiste
    const res = await toggleFavori(profil.id);
    if (res.error) {
      setFavori(!cible);
      toast(res.error, "error");
    } else {
      setFavori(!!res.favori);
    }
  };

  const dispo = profil.statut === "Disponible";

  return (
    <Link
      href={`/profil/${profil.id}`}
      className="block overflow-hidden rounded-carte border border-bordure bg-carte transition-colors hover:border-bordure-forte"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-media">
        {profil.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profil.photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-tertiaire">
            <EyeOff className="h-7 w-7" strokeWidth={1.5} />
            <span className="mt-1 text-[11px]">visage flouté</span>
          </div>
        )}

        {profil.badge === "Urgent" && (
          <span className="absolute left-2 top-2 rounded-pill bg-etoile px-2 py-0.5 text-[11px] font-medium text-sur-vert">
            Urgent
          </span>
        )}
        {profil.badge === "TOP" && (
          <span className="absolute left-2 top-2 rounded-pill bg-action-verte px-2 py-0.5 text-[11px] font-medium text-white">
            TOP
          </span>
        )}
        {profil.badge === "VIP" && (
          <span className="absolute left-2 top-2 rounded-pill bg-vip px-2 py-0.5 text-[11px] font-medium text-white">
            VIP
          </span>
        )}
        {profil.badge === "Premium" && (
          <span className="absolute left-2 top-2 rounded-pill bg-feuille px-2 py-0.5 text-[11px] font-medium text-sur-vert">
            Premium
          </span>
        )}

        <button
          type="button"
          onClick={onCoeur}
          aria-label={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute right-2 top-2"
        >
          <Heart
            className="h-[18px] w-[18px] drop-shadow"
            style={{ color: "#E11D48" }}
            fill={favori ? "#E11D48" : "rgba(255,255,255,0.55)"}
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-principal">{profil.pseudo}</span>
          {profil.verifie && <BadgeCheck className="h-4 w-4 text-feuille" strokeWidth={2} />}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-secondaire">
          <Star className="h-3 w-3 text-etoile" fill="#E0A024" strokeWidth={0} />
          <span>
            {profil.note.toLocaleString("fr-FR", { minimumFractionDigits: 1 })} ({profil.avis})
          </span>
          <span>· {profil.categorie}</span>
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs text-secondaire">
          <MapPin className="h-3.5 w-3.5 text-action-verte" strokeWidth={1.75} />
          <span>{profil.ville}</span>
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-tertiaire">
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {(profil.nbVues ?? 0).toLocaleString("fr-FR")}</span>
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {(profil.nbFavoris ?? 0).toLocaleString("fr-FR")}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span
            className={
              dispo
                ? "rounded-pill bg-tint-succes px-2.5 py-1 text-[11px] text-texte-succes"
                : "rounded-pill bg-pill-fond px-2.5 py-1 text-[11px] text-pill-texte"
            }
          >
            {profil.statut}
          </span>
          <span className="text-sm font-medium text-principal">
            {profil.prix > 0 ? `dès ${profil.prix.toLocaleString("fr-FR")} F` : "À convenir"}
          </span>
        </div>
      </div>
    </Link>
  );
}
