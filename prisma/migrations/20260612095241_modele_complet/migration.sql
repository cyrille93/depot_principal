/*
  Warnings:

  - A unique constraint covering the columns `[codeParrainage]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeParrainage` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategorieAnnonce" AS ENUM ('RENCONTRE', 'MASSAGE', 'SPA', 'PRODUITS');

-- CreateEnum
CREATE TYPE "StatutAnnonce" AS ENUM ('BROUILLON', 'EN_ATTENTE', 'ACTIVE', 'SUSPENDUE', 'REFUSEE', 'SUPPRIMEE');

-- CreateEnum
CREATE TYPE "TypeMedia" AS ENUM ('PHOTO', 'VIDEO');

-- CreateEnum
CREATE TYPE "TypeVerification" AS ENUM ('TELEPHONE', 'IDENTITE', 'SELFIE');

-- CreateEnum
CREATE TYPE "StatutVerification" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "TypeMouvement" AS ENUM ('RECHARGE', 'COMMISSION', 'BONUS', 'ACHAT_PREMIUM', 'TRANSFERT_ENVOYE', 'TRANSFERT_RECU');

-- CreateEnum
CREATE TYPE "OperateurPaiement" AS ENUM ('ORANGE_MONEY', 'MTN_MOMO');

-- CreateEnum
CREATE TYPE "StatutRecharge" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'ECHEC');

-- CreateEnum
CREATE TYPE "StatutParrainage" AS ENUM ('ACTIF', 'SUSPENDU', 'EXPIRE');

-- CreateEnum
CREATE TYPE "StatutCommission" AS ENUM ('EN_ATTENTE', 'VERSEE', 'PERDUE');

-- CreateEnum
CREATE TYPE "TypeOptionPremium" AS ENUM ('MISE_EN_AVANT', 'SPONSORISEE', 'BADGE_PREMIUM', 'GALERIE_ETENDUE');

-- CreateEnum
CREATE TYPE "CibleSignalement" AS ENUM ('PROFIL', 'ANNONCE', 'MESSAGE');

-- CreateEnum
CREATE TYPE "MotifSignalement" AS ENUM ('FAUX_PROFIL', 'CONTENU_INAPPROPRIE', 'HARCELEMENT', 'ARNAQUE');

-- CreateEnum
CREATE TYPE "StatutSignalement" AS ENUM ('OUVERT', 'TRAITE', 'REJETE');

-- AlterTable
ALTER TABLE "Profil" ADD COLUMN     "nombreAvis" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "noteMoyenne" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "scoreReputation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tauxReponse" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeParrainage" TEXT NOT NULL,
ADD COLUMN     "identiteVerifiee" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selfieVerifie" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Annonce" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categorie" "CategorieAnnonce" NOT NULL,
    "prix" INTEGER NOT NULL,
    "statut" "StatutAnnonce" NOT NULL DEFAULT 'EN_ATTENTE',
    "estBoostee" BOOLEAN NOT NULL DEFAULT false,
    "boostExpire" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "villeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Annonce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "annonceId" TEXT NOT NULL,
    "type" "TypeMedia" NOT NULL DEFAULT 'PHOTO',
    "url" TEXT NOT NULL,
    "floutee" BOOLEAN NOT NULL DEFAULT false,
    "visagesFloutes" INTEGER NOT NULL DEFAULT 0,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avis" (
    "id" TEXT NOT NULL,
    "annonceId" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "noteQualite" INTEGER,
    "notePonctualite" INTEGER,
    "noteAccueil" INTEGER,
    "noteRapportQualitePrix" INTEGER,
    "noteSatisfaction" INTEGER,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favori" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "annonceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TypeVerification" NOT NULL,
    "statut" "StatutVerification" NOT NULL DEFAULT 'EN_ATTENTE',
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portefeuille" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "solde" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portefeuille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementPortefeuille" (
    "id" TEXT NOT NULL,
    "portefeuilleId" TEXT NOT NULL,
    "type" "TypeMouvement" NOT NULL,
    "montant" INTEGER NOT NULL,
    "libelle" TEXT NOT NULL,
    "refExterne" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MouvementPortefeuille_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recharge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "operateur" "OperateurPaiement" NOT NULL,
    "statut" "StatutRecharge" NOT NULL DEFAULT 'EN_ATTENTE',
    "refOperateur" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransfertInterne" (
    "id" TEXT NOT NULL,
    "emetteurId" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransfertInterne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parrainage" (
    "id" TEXT NOT NULL,
    "parrainId" TEXT NOT NULL,
    "filleulId" TEXT NOT NULL,
    "codeUtilise" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "statut" "StatutParrainage" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parrainage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "parrainageId" TEXT NOT NULL,
    "rechargeId" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "moisRef" TEXT NOT NULL,
    "statut" "StatutCommission" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionPremium" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "annonceId" TEXT,
    "type" "TypeOptionPremium" NOT NULL,
    "montant" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateExpire" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OptionPremium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signalement" (
    "id" TEXT NOT NULL,
    "auteurId" TEXT NOT NULL,
    "cibleType" "CibleSignalement" NOT NULL,
    "cibleId" TEXT NOT NULL,
    "motif" "MotifSignalement" NOT NULL,
    "statut" "StatutSignalement" NOT NULL DEFAULT 'OUVERT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signalement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Annonce_userId_idx" ON "Annonce"("userId");

-- CreateIndex
CREATE INDEX "Annonce_villeId_idx" ON "Annonce"("villeId");

-- CreateIndex
CREATE INDEX "Annonce_categorie_idx" ON "Annonce"("categorie");

-- CreateIndex
CREATE INDEX "Annonce_statut_idx" ON "Annonce"("statut");

-- CreateIndex
CREATE INDEX "Media_annonceId_idx" ON "Media"("annonceId");

-- CreateIndex
CREATE INDEX "Avis_annonceId_idx" ON "Avis"("annonceId");

-- CreateIndex
CREATE UNIQUE INDEX "Avis_annonceId_auteurId_key" ON "Avis"("annonceId", "auteurId");

-- CreateIndex
CREATE UNIQUE INDEX "Favori_userId_annonceId_key" ON "Favori"("userId", "annonceId");

-- CreateIndex
CREATE INDEX "Verification_userId_idx" ON "Verification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Portefeuille_userId_key" ON "Portefeuille"("userId");

-- CreateIndex
CREATE INDEX "MouvementPortefeuille_portefeuilleId_idx" ON "MouvementPortefeuille"("portefeuilleId");

-- CreateIndex
CREATE INDEX "Recharge_userId_idx" ON "Recharge"("userId");

-- CreateIndex
CREATE INDEX "TransfertInterne_emetteurId_idx" ON "TransfertInterne"("emetteurId");

-- CreateIndex
CREATE INDEX "TransfertInterne_destinataireId_idx" ON "TransfertInterne"("destinataireId");

-- CreateIndex
CREATE UNIQUE INDEX "Parrainage_filleulId_key" ON "Parrainage"("filleulId");

-- CreateIndex
CREATE INDEX "Parrainage_parrainId_idx" ON "Parrainage"("parrainId");

-- CreateIndex
CREATE INDEX "Commission_parrainageId_idx" ON "Commission"("parrainageId");

-- CreateIndex
CREATE INDEX "OptionPremium_userId_idx" ON "OptionPremium"("userId");

-- CreateIndex
CREATE INDEX "Signalement_statut_idx" ON "Signalement"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "User_codeParrainage_key" ON "User"("codeParrainage");

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_villeId_fkey" FOREIGN KEY ("villeId") REFERENCES "Ville"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avis" ADD CONSTRAINT "Avis_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portefeuille" ADD CONSTRAINT "Portefeuille_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementPortefeuille" ADD CONSTRAINT "MouvementPortefeuille_portefeuilleId_fkey" FOREIGN KEY ("portefeuilleId") REFERENCES "Portefeuille"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recharge" ADD CONSTRAINT "Recharge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfertInterne" ADD CONSTRAINT "TransfertInterne_emetteurId_fkey" FOREIGN KEY ("emetteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfertInterne" ADD CONSTRAINT "TransfertInterne_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parrainage" ADD CONSTRAINT "Parrainage_parrainId_fkey" FOREIGN KEY ("parrainId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parrainage" ADD CONSTRAINT "Parrainage_filleulId_fkey" FOREIGN KEY ("filleulId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_parrainageId_fkey" FOREIGN KEY ("parrainageId") REFERENCES "Parrainage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_rechargeId_fkey" FOREIGN KEY ("rechargeId") REFERENCES "Recharge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionPremium" ADD CONSTRAINT "OptionPremium_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionPremium" ADD CONSTRAINT "OptionPremium_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "Annonce"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signalement" ADD CONSTRAINT "Signalement_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
