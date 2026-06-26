import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type SpirebirdCard = {
  key: string
  elo: number
  eloBT: number
  offered: number
  picked: number
  pickRate: number
  wins: number
  winRate: number
  war: number
  warA1: number
  warA2: number
  warA3: number
  cWar: number
  cpwarPerPick: number
  floorScaling: number
  warDelta: number
  pHP: number
  pDMG: number
  reliable: boolean
}

type CohortData = {
  summary: { runCount: number; winRate: number }
  cards: SpirebirdCard[]
}

type SpirebirdJson = {
  generatedAt: string
  cohorts: Record<string, CohortData>
}

// Parse card key: "ADRENALINE_1_0_REGENT_0.107.1"
// Format: cardName_upgradeLevel_unknown_character_buildId
function parseKey(key: string): { cardId: string; character: string; upgraded: boolean } | null {
  const parts = key.split('_')
  if (parts.length < 4) return null

  // build version is last part (contains dots like "0.107.1")
  // character is second to last
  // find where build version starts by looking for the part containing dots
  let buildIdx = parts.length - 1
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i].includes('.')) { buildIdx = i; break }
  }

  const character = parts[buildIdx - 1]
  const upgradeLevel = parseInt(parts[buildIdx - 2]) > 0
  const cardId = parts.slice(0, buildIdx - 2).join('_')

  return { cardId, character, upgraded: upgradeLevel }
}

async function main() {
  const filePath = `${process.env.HOME}/Downloads/cohort_stats.json`
  
  if (!fs.existsSync(filePath)) {
    console.error('cohort_stats.json not found at', filePath)
    process.exit(1)
  }

  console.log('Reading Spirebird cohort stats...')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data: SpirebirdJson = JSON.parse(raw)

  console.log('Generated at:', data.generatedAt)
  console.log('Cohorts:', Object.keys(data.cohorts))

  // Delete existing Spirebird stats
  await prisma.spirebirdStat.deleteMany()
  console.log('Cleared existing Spirebird stats')

  let imported = 0
  let skipped = 0

  for (const [cohortId, cohort] of Object.entries(data.cohorts)) {
    console.log(`Processing cohort: ${cohortId} (${cohort.cards.length} cards)`)

    for (const card of cohort.cards) {
      if (!card.reliable) { skipped++; continue }

      const parsed = parseKey(card.key)
      if (!parsed) { skipped++; continue }

      await prisma.spirebirdStat.create({
        data: {
          cardId: parsed.cardId,
          character: parsed.character,
          upgraded: parsed.upgraded,
          cohort: cohortId,
          elo: card.elo,
          eloBT: card.eloBT,
          offered: card.offered,
          picked: card.picked,
          pickRate: card.pickRate,
          wins: card.wins,
          winRate: card.winRate ?? null,
          war: card.war,
          warA1: card.warA1,
          warA2: card.warA2,
          warA3: card.warA3,
          cWar: card.cWar,
          floorScaling: card.floorScaling,
          warDelta: card.warDelta,
          pHP: card.pHP,
          pDMG: card.pDMG,
        }
      })
      imported++
    }
  }

  console.log(`Done! Imported ${imported}, skipped ${skipped}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); process.exit(1) })