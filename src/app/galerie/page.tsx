import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Video } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { MARQUE_SEO, SITE_URL } from "@/lib/seo";
import { GalerieVideoCarte, type VideoGalerieVue } from "@/components/GalerieVideoCarte";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Galerie vidéo — ${MARQUE_SEO}`,
  description: `Les vidéos mises en avant par ${MARQUE_SEO}.`,
  alternates: { canonical: `${SITE_URL}/galerie` },
};

function dateFr(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(d);
}

// Formes exactes renvoyées par les requêtes (sélections ci-dessous).
type LigneCommentaire = {
  id: string;
  contenu: string;
  createdAt: Date;
  userId: string;
  user: { profil: { pseudo: string } | null };
};
type LigneVideo = {
  id: string;
  titre: string;
  description: string | null;
  url: string;
  vues: number;
  _count: { likes: number; commentaires: number };
  commentaires: LigneCommentaire[];
};

export default async function GaleriePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const estConnecte = !!session?.user;
  const estAdmin = session?.user?.role === "ADMIN";

  let rows: LigneVideo[] = [];
  try {
    rows = (await db.videoGalerie.findMany({
      orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        titre: true,
        description: true,
        url: true,
        vues: true,
        _count: { select: { likes: true, commentaires: true } },
        commentaires: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            contenu: true,
            createdAt: true,
            userId: true,
            user: { select: { profil: { select: { pseudo: true } } } },
          },
        },
      },
    })) as LigneVideo[];
  } catch {
    // Migration pas encore appliquée : on affiche les vidéos sans les interactions
    // plutôt que de planter la page.
    const base = (await db.videoGalerie.findMany({
      orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
      select: { id: true, titre: true, description: true, url: true },
    })) as { id: string; titre: string; description: string | null; url: string }[];
    rows = base.map((b) => ({
      ...b,
      vues: 0,
      _count: { likes: 0, commentaires: 0 },
      commentaires: [],
    }));
  }

  // Vidéos aimées par l'utilisateur connecté (pour pré-remplir l'état du cœur)
  let aimees = new Set<string>();
  if (userId && rows.length) {
    try {
      const likes = (await db.videoGalerieLike.findMany({
        where: { userId, videoId: { in: rows.map((r) => r.id) } },
        select: { videoId: true },
      })) as { videoId: string }[];
      aimees = new Set(likes.map((l) => l.videoId));
    } catch {
      /* table absente : aucun j'aime pré-rempli */
    }
  }

  const videos: VideoGalerieVue[] = rows.map((v) => ({
    id: v.id,
    titre: v.titre,
    description: v.description,
    url: v.url,
    vues: v.vues,
    nbLikes: v._count.likes,
    nbCommentaires: v._count.commentaires,
    aime: aimees.has(v.id),
    commentaires: v.commentaires.map((c) => ({
      id: c.id,
      contenu: c.contenu,
      auteur: c.user.profil?.pseudo?.trim() || "Membre",
      date: dateFr(c.createdAt),
      peutSupprimer: estAdmin || c.userId === userId,
    })),
  }));

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-5">
      <header className="mb-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm text-secondaire">
          <ChevronLeft className="h-5 w-5" /> Accueil
        </Link>
      </header>

      <h1 className="flex items-center gap-2 text-2xl font-medium text-principal">
        <Video className="h-6 w-6 text-action-verte" /> Galerie vidéo
      </h1>
      <p className="mt-1 text-sm text-secondaire">Les vidéos mises en avant par {MARQUE_SEO}.</p>

      {videos.length === 0 ? (
        <div className="mt-6 rounded-carte border border-bordure bg-carte p-10 text-center text-sm text-secondaire">
          Aucune vidéo pour le moment.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <GalerieVideoCarte key={v.id} video={v} estConnecte={estConnecte} />
          ))}
        </div>
      )}
    </main>
  );
}
