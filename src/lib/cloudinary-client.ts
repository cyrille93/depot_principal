"use client";

// Upload direct (non signé) d'une vidéo vers Cloudinary, depuis le navigateur.
// Le fichier ne transite PAS par notre serveur — c'est ce qui permet les 100 Mo.
// Identifiants publics (non secrets) lus depuis les variables NEXT_PUBLIC_*.

export const TAILLE_MAX_VIDEO = 100 * 1024 * 1024; // 100 Mo

export function cloudinaryConfigure(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

export type UploadResult = { ok: boolean; url?: string; error?: string };

export async function uploadVideoCloudinary(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResult> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) return { ok: false, error: "Hébergement vidéo non configuré." };

  if (!file.type.startsWith("video/")) return { ok: false, error: "Ce fichier n'est pas une vidéo." };
  if (file.size > TAILLE_MAX_VIDEO) return { ok: false, error: "Vidéo trop lourde (100 Mo maximum)." };

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  // XMLHttpRequest pour avoir la progression de l'envoi.
  return new Promise<UploadResult>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud}/video/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve({ ok: true, url: data.secure_url as string });
        } else {
          resolve({ ok: false, error: data?.error?.message ?? "Échec de l'envoi de la vidéo." });
        }
      } catch {
        resolve({ ok: false, error: "Réponse Cloudinary illisible." });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "Impossible de joindre l'hébergeur vidéo." });
    xhr.send(form);
  });
}
