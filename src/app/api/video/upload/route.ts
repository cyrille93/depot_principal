import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";

// Route qui délivre un jeton d'upload direct navigateur → Vercel Blob.
// Le fichier ne transite PAS par le serveur (contournement de la limite
// Vercel de 4,5 Mo), ce qui permet les vidéos jusqu'à 100 Mo.
export const runtime = "nodejs";

const TAILLE_MAX_VIDEO = 100 * 1024 * 1024; // 100 Mo

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const resultat = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Seul un utilisateur connecté peut obtenir un jeton d'upload.
        const session = await auth();
        if (!session?.user) throw new Error("Connexion requise pour envoyer une vidéo.");
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "video/x-matroska",
            "video/3gpp",
            "video/x-msvideo",
          ],
          maximumSizeInBytes: TAILLE_MAX_VIDEO,
          addRandomSuffix: true,
        };
      },
      // Rien à enregistrer ici : l'URL publique renvoyée au navigateur est
      // ensuite sauvegardée via nos actions serveur (galerie / annonce).
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(resultat);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message ?? "Échec de l'autorisation d'upload." },
      { status: 400 }
    );
  }
}
