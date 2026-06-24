-- AlterTable
ALTER TABLE "CardOffer" ADD COLUMN     "preDamage" INTEGER,
ADD COLUMN     "preGold" INTEGER,
ADD COLUMN     "preHp" INTEGER,
ADD COLUMN     "preMaxHp" INTEGER;

-- AlterTable
ALTER TABLE "Run" ADD COLUMN     "buildId" TEXT,
ADD COLUMN     "gameMode" TEXT,
ADD COLUMN     "killedBy" TEXT,
ADD COLUMN     "runTime" INTEGER,
ADD COLUMN     "seed" TEXT;
