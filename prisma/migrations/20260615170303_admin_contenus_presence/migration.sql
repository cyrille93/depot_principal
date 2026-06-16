-- AlterTable
ALTER TABLE "User" ADD COLUMN     "derniereActivite" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContenuPage" (
    "cle" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "corps" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContenuPage_pkey" PRIMARY KEY ("cle")
);
