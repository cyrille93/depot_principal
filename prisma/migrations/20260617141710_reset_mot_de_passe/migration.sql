-- CreateEnum
CREATE TYPE "StatutDemandeReset" AS ENUM ('OUVERTE', 'TRAITEE', 'REJETEE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "doitChangerMotDePasse" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DemandeReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identifiant" TEXT NOT NULL,
    "statut" "StatutDemandeReset" NOT NULL DEFAULT 'OUVERTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "traiteeAt" TIMESTAMP(3),

    CONSTRAINT "DemandeReset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DemandeReset" ADD CONSTRAINT "DemandeReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
