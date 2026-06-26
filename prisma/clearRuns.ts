import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.cardOffer.deleteMany()
  await prisma.run.deleteMany()
  console.log('Cleared runs and offers')
}

main().finally(() => prisma.$disconnect())
