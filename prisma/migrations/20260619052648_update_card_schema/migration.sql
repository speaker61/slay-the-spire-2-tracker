-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isXCost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT[];
