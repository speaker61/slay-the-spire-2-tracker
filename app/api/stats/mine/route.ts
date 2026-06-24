import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CardStats } from '@/app/api/stats/route'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ascension = searchParams.get('ascension')

  // Build run filter
  const runWhere = {
    result: { not: 'abandoned' },
    ...(ascension ? { ascension: parseInt(ascension) } : {}),
  }

  // Get all runs matching filter
  const runs = await prisma.run.findMany({
    where: runWhere,
    select: { id: true, result: true }
  })

  const runIds = runs.map(r => r.id)
  const winningRunIds = new Set(
    runs.filter(r => r.result === 'win').map(r => r.id)
  )

  if (runIds.length === 0) {
    return NextResponse.json({})
  }

  // Get all card offers from those runs
  const offers = await prisma.cardOffer.findMany({
    where: { runId: { in: runIds } },
    select: {
      cardId: true,
      picked: true,
      runId: true,
    }
  })

  // Build stats per card
  const statsMap: Record<string, CardStats> = {}

  for (const offer of offers) {
    if (!statsMap[offer.cardId]) {
      statsMap[offer.cardId] = {
        pickRate: 0,
        war: 0,
        offered: 0,
        picked: 0,
        totalRunsWith: 0,
        winRuns: 0,
      }
    }

    const stat = statsMap[offer.cardId]
    stat.offered++

    if (offer.picked) {
      stat.picked++
    }
  }

  // Calculate pick rates and WAR
  // WAR needs to be per run not per offer
  // Get picked offers grouped by run
  const pickedOffers = offers.filter(o => o.picked)

  // Track which runs each card was picked in
  const cardRunMap: Record<string, Set<string>> = {}
  for (const offer of pickedOffers) {
    if (!cardRunMap[offer.cardId]) {
      cardRunMap[offer.cardId] = new Set()
    }
    cardRunMap[offer.cardId].add(offer.runId)
  }

  // Calculate final stats
  for (const [cardId, stat] of Object.entries(statsMap)) {
    stat.pickRate = stat.offered > 0
      ? Math.round((stat.picked / stat.offered) * 1000) / 10
      : 0

    const runsWithCard = cardRunMap[cardId]
    if (runsWithCard) {
      stat.totalRunsWith = Array.from(runsWithCard).length
      stat.winRuns = [...runsWithCard].filter(id => winningRunIds.has(id)).length
      stat.war = stat.totalRunsWith > 0
        ? Math.round((stat.winRuns / stat.totalRunsWith) * 1000) / 10
        : 0
    }
  }

  return NextResponse.json(statsMap)
}