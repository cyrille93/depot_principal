"use client";

// Upload direct d'une vidéo vers Vercel Blob, depuis le navigateur.
// Le fichier va directement du navigateur vers le stockage Blob (via un jeton
// délivré par /api/video/upload) : il ne passe pas par notre serveur, d'où la
// prise en charge des fichiers jusqu'à 100 Mo. Les fichiers Blob sont publics
// (URL directe, CDN) — aucun problème de signature ni d'« ACL deny ».

import { upload } from "@vercel/blob/client";

export const TAILLE_MAX_VIDEO = 100 * 1024 * 1024; // 100 Mo

export type UploadResult = { ok: boolean; url?: string; error?: string };

export async function uploadVideoBlob(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  if (!file.type.startsWith("video/")) return { ok: false, error: "Ce fichier n'est pas une vidéo." };
  if (file.size > TAILLE_MAX_VIDEO) return { ok: false, error: "Vidéo trop lourde (100 Mo maximum)." };

  try {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/video/upload",
      contentType: file.type,
      multipart: true, // upload résilient par morceaux pour les gros fichiers
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round(e.percentage));
      },
    });
    return { ok: true, url: blob.url };
  } catch (e) {
    return { ok: false, error: (e as Error).message || "Échec de l'envoi de la vidéo." };
  }
}
