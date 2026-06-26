-- CreateTable
CREATE TABLE "SpirebirdStat" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "upgraded" BOOLEAN NOT NULL,
    "cohort" TEXT NOT NULL,
    "elo" DOUBLE PRECISION,
    "eloBT" DOUBLE PRECISION,
    "offered" INTEGER NOT NULL,
    "picked" INTEGER NOT NULL,
    "pickRate" DOUBLE PRECISION NOT NULL,
    "wins" INTEGER NOT NULL,
    "winRate" DOUBLE PRECISION NOT NULL,
    "war" DOUBLE PRECISION,
    "warA1" DOUBLE PRECISION,
    "warA2" DOUBLE PRECISION,
    "warA3" DOUBLE PRECISION,
    "cWar" DOUBLE PRECISION,
    "floorScaling" DOUBLE PRECISION,
    "warDelta" DOUBLE PRECISION,
    "pHP" DOUBLE PRECISION,
    "pDMG" DOUBLE PRECISION,

    CONSTRAINT "SpirebirdStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpirebirdStat_cardId_cohort_idx" ON "SpirebirdStat"("cardId", "cohort");
