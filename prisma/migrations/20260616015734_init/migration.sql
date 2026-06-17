-- CreateTable
CREATE TABLE "Run" (
    "id" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "ascension" INTEGER,
    "actReached" INTEGER,
    "floorReached" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "character" TEXT,
    "rarity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cost" INTEGER,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardOffer" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "act" INTEGER,
    "floor" INTEGER,
    "source" TEXT NOT NULL,
    "picked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardOffer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CardOffer" ADD CONSTRAINT "CardOffer_runId_fkey" FOREIGN KEY ("runId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardOffer" ADD CONSTRAINT "CardOffer_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
