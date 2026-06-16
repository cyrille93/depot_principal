-- CreateTable
CREATE TABLE "Blocage" (
    "id" TEXT NOT NULL,
    "bloqueurId" TEXT NOT NULL,
    "bloqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blocage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Blocage_bloqueId_idx" ON "Blocage"("bloqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Blocage_bloqueurId_bloqueId_key" ON "Blocage"("bloqueurId", "bloqueId");

-- AddForeignKey
ALTER TABLE "Blocage" ADD CONSTRAINT "Blocage_bloqueurId_fkey" FOREIGN KEY ("bloqueurId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocage" ADD CONSTRAINT "Blocage_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
