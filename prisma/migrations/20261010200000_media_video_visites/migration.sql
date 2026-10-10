-- Ajout du type VIDEO aux médias
ALTER TYPE "TypeMedia" ADD VALUE IF NOT EXISTS 'VIDEO';

-- Suivi des visites (statistiques globales, sans détail nominatif)
CREATE TABLE IF NOT EXISTS "VisiteSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "derniereActivite" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nbEvenements" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "VisiteSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VisiteSession_sessionId_key" ON "VisiteSession"("sessionId");
CREATE INDEX IF NOT EXISTS "VisiteSession_debut_idx" ON "VisiteSession"("debut");
