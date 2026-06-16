-- CreateEnum
CREATE TYPE "NiveauMiseEnAvant" AS ENUM ('STANDARD', 'URGENT', 'VIP', 'TOP', 'PREMIUM');

-- AlterTable
ALTER TABLE "Annonce" ADD COLUMN     "miseEnAvant" "NiveauMiseEnAvant" NOT NULL DEFAULT 'STANDARD';
