import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Fetching cards from Spire Codex...')
  
  const res = await fetch('https://raw.githubusercontent.com/ptrlrd/spire-codex/main/data/eng/cards.json')
  const cards = await res.json()
  
  console.log(`Found ${cards.length} cards. Importing...`)

  const mapped = cards.map((card: any) => ({
    id:        card.id,
    name:      card.name,
    character: card.color ?? null,
    rarity:    card.rarity,
    type:      card.type,
    cost:      card.cost ?? null,
    isXCost:   card.is_x_cost ?? false,
    keywords:  card.keywords ?? [],
    imageUrl:  card.image_url ?? null,
  }))

  await prisma.cardOffer.deleteMany()
  await prisma.card.deleteMany()
  await prisma.card.createMany({ data: mapped })

  console.log(`Done! Imported ${mapped.length} cards.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })