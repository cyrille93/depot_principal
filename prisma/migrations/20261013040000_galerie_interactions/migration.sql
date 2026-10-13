-- Vues, j'aime et commentaires sur les vidéos de la galerie (non destructif)

-- Compteur de vues sur VideoGalerie
ALTER TABLE "VideoGalerie" ADD COLUMN IF NOT EXISTS "vues" INTEGER NOT NULL DEFAULT 0;

-- Table des j'aime
CREATE TABLE IF NOT EXISTS "VideoGalerieLike" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoGalerieLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VideoGalerieLike_videoId_userId_key" ON "VideoGalerieLike"("videoId", "userId");
CREATE INDEX IF NOT EXISTS "VideoGalerieLike_videoId_idx" ON "VideoGalerieLike"("videoId");

-- Table des commentaires
CREATE TABLE IF NOT EXISTS "VideoGalerieCommentaire" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoGalerieCommentaire_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VideoGalerieCommentaire_videoId_idx" ON "VideoGalerieCommentaire"("videoId");
CREATE INDEX IF NOT EXISTS "VideoGalerieCommentaire_createdAt_idx" ON "VideoGalerieCommentaire"("createdAt");

-- Clés étrangères (ajoutées seulement si absentes)
DO $$ BEGIN
  ALTER TABLE "VideoGalerieLike" ADD CONSTRAINT "VideoGalerieLike_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoGalerie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "VideoGalerieLike" ADD CONSTRAINT "VideoGalerieLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "VideoGalerieCommentaire" ADD CONSTRAINT "VideoGalerieCommentaire_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoGalerie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  ALTER TABLE "VideoGalerieCommentaire" ADD CONSTRAINT "VideoGalerieCommentaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
