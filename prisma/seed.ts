import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.card.createMany({
    data: [
      {
        name: "Catalyst",
        character: "Silent",
        rarity: "Rare",
        type: "Skill",
        cost: 1,
      },
      {
        name: "Footwork",
        character: "Silent",
        rarity: "Uncommon",
        type: "Skill",
        cost: 1,
      },
      {
        name: "Strike",
        character: "Neutral",
        rarity: "Basic",
        type: "Attack",
        cost: 1,
      },
    ],
  });

  const run = await prisma.run.create({
    data: {
      character: "Silent",
      result: "win",
      ascension: 5,
      actReached: 3,
      floorReached: 48,
      notes: "Seed run",
    },
  });

  const cards = await prisma.card.findMany();

  await prisma.cardOffer.create({
    data: {
      runId: run.id,
      cardId: cards[0].id,
      act: 1,
      floor: 6,
      source: "combat",
      picked: true,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });