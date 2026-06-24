import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

const STEAM_RUN_PATH = path.join(
  process.env.HOME!,
  '.local/share/Steam/userdata/39057731/2868840/remote/profile1/saves/history'
)

function stripPrefix(id: string, prefix: string): string {
  return id.startsWith(prefix) ? id.slice(prefix.length) : id
}

function parseRun(data: any) {
  const player = data.players?.[0]
  if (!player) return null

  const character = stripPrefix(player.character, 'CHARACTER.')
  const result = data.win ? 'win' : data.was_abandoned ? 'abandoned' : 'loss'
  const killedBy = data.killed_by_encounter !== 'NONE.NONE'
    ? stripPrefix(data.killed_by_encounter, 'ENCOUNTER.')
    : null

  // Collect all card offers from map_point_history
  const offers: any[] = []
  const history: any[][] = data.map_point_history ?? []

  history.forEach((act, actIndex) => {
    act.forEach((point, floorIndex) => {
      const playerStats = point.player_stats?.[0]
      if (!playerStats?.card_choices) return

      playerStats.card_choices.forEach((choice: any) => {
        const rawId = choice.card?.id
        if (!rawId) return
        const cardId = stripPrefix(rawId, 'CARD.')

        offers.push({
          cardId,
          act: actIndex + 1,
          floor: floorIndex + 1,
          source: point.map_point_type ?? 'unknown',
          picked: choice.was_picked ?? false,
          preHp: playerStats.current_hp ?? null,
          preMaxHp: playerStats.max_hp ?? null,
          preDamage: playerStats.damage_taken ?? null,
          preGold: playerStats.current_gold ?? null,
        })
      })
    })
  })

  return {
    character,
    result,
    ascension: data.ascension ?? null,
    seed: data.seed ? String(data.seed) : null,
    gameMode: data.game_mode ?? null,
    buildId: data.build_id ?? null,
    killedBy,
    runTime: data.run_time ?? null,
    actReached: history.length,
    floorReached: history[history.length - 1]?.length ?? null,
    offers,
  }
}

export async function POST() {
  try {
    if (!fs.existsSync(STEAM_RUN_PATH)) {
      return NextResponse.json({ error: 'Steam run folder not found' }, { status: 404 })
    }

    const files = fs.readdirSync(STEAM_RUN_PATH).filter(f => f.endsWith('.run'))

    // Get all card IDs from DB for validation
    const allCards = await prisma.card.findMany({ select: { id: true } })
    const validCardIds = new Set(allCards.map(c => c.id))

    let imported = 0
    let skipped = 0
    let errors = 0

    for (const file of files) {
      try {
        const filePath = path.join(STEAM_RUN_PATH, file)
        const raw = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(raw)

        // Skip abandoned runs
        if (data.was_abandoned) { skipped++; continue }

        const parsed = parseRun(data)
        if (!parsed) { skipped++; continue }

        // Skip if run already imported (using seed as unique key)
        if (parsed.seed) {
          const existing = await prisma.run.findFirst({ where: { seed: parsed.seed } })
          if (existing) { skipped++; continue }
        }

        // Filter offers to only cards that exist in our DB
        const validOffers = parsed.offers.filter(o => validCardIds.has(o.cardId))

        // Create run and offers together
        await prisma.run.create({
          data: {
            character: parsed.character,
            result: parsed.result,
            ascension: parsed.ascension,
            seed: parsed.seed,
            gameMode: parsed.gameMode,
            buildId: parsed.buildId,
            killedBy: parsed.killedBy,
            runTime: parsed.runTime,
            actReached: parsed.actReached,
            floorReached: parsed.floorReached,
            offers: {
              create: validOffers.map(o => ({
                cardId: o.cardId,
                act: o.act,
                floor: o.floor,
                source: o.source,
                picked: o.picked,
                preHp: o.preHp,
                preMaxHp: o.preMaxHp,
                preDamage: o.preDamage,
                preGold: o.preGold,
              }))
            }
          }
        })

        imported++
      } catch (e) {
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      total: files.length,
    })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}