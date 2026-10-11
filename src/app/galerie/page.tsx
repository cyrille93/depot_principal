import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Video } from "lucide-react";
import { db } from "@/lib/db";
import { MARQUE_SEO, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Galerie vidéo — ${MARQUE_SEO}`,
  description: `Les vidéos mises en avant par ${MARQUE_SEO}.`,
  alternates: { canonical: `${SITE_URL}/galerie` },
};

type VideoRow = { id: string; titre: string; description: string | null; url: string };

export default async function GaleriePage() {
  const videos = (await db.videoGalerie.findMany({
    orderBy: [{ ordre: "asc" }, { createdAt: "desc" }],
    select: { id: true, titre: true, description: true, url: true },
  })) as VideoRow[];

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
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div key={v.id} className="overflow-hidden rounded-carte border border-bordure bg-carte">
              <div className="aspect-video bg-black">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={v.url} controls preload="metadata" className="h-full w-full object-contain" />
              </div>
              <div className="p-3">
                <h2 className="text-sm font-medium text-principal">{v.titre}</h2>
                {v.description && <p className="mt-1 text-xs text-secondaire">{v.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
