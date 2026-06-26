import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CardStats } from '@/app/api/stats/route'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ascension = searchParams.get('ascension')
    const cohort = ascension === '10' ? 'a10' : 'all'

    const stats = await prisma.spirebirdStat.findMany({
      where: { cohort }
    })

    console.log('spirebird stats count:', stats.length)

    const statsMap: Record<string, CardStats> = {}

    for (const stat of stats) {
      const baseCardId = stat.cardId.replace(/_\d+$/, '')

      if (!statsMap[baseCardId]) {
        statsMap[baseCardId] = {
          pickRate: 0,
          war: 0,
          offered: 0,
          picked: 0,
          totalRunsWith: 0,
          winRuns: 0,
        }
      }

      const existing = statsMap[baseCardId]
      existing.offered += stat.offered
      existing.picked += stat.picked
      existing.winRuns += stat.wins
      existing.totalRunsWith += stat.picked
    }

    for (const [, stat] of Object.entries(statsMap)) {
      stat.pickRate = stat.offered > 0
        ? Math.round((stat.picked / stat.offered) * 1000) / 10
        : 0
      stat.war = stat.totalRunsWith > 0
        ? Math.round((stat.winRuns / stat.totalRunsWith) * 1000) / 10
        : 0
    }

    return NextResponse.json(statsMap)

  } catch (e) {
    console.error('spirebird route error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}