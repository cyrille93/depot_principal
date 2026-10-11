-- Galerie de vidéos gérée par l'admin
CREATE TABLE IF NOT EXISTS "VideoGalerie" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoGalerie_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VideoGalerie_ordre_idx" ON "VideoGalerie"("ordre");
