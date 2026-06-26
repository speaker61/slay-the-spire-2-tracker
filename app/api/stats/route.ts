import { NextResponse } from 'next/server'

type CardPickRate = {
  card_id: string
  offered: number
  picked: number
  pick_rate: number
}

type CardTopStat = {
  card_id: string
  count: number
  in_wins: number
  in_losses: number
  win_runs: number
  total_runs_with: number
}

export type CardStats = {
  pickRate: number
  war: number
  offered: number
  picked: number
  totalRunsWith: number
  winRuns: number
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ascension = searchParams.get('ascension') // '10' or null
  const source = searchParams.get('source') // source is spirebird or mine

  if (source === 'spirebird') {
    const sbUrl = new URL('/api/stats/spirebird', req.url)
    if (ascension) sbUrl.searchParams.set('ascension', ascension)
    const sbRes = await fetch(sbUrl.toString())
    const sbData = await sbRes.json()
    return NextResponse.json(sbData)
  }

  if (source === 'mine') {
    const mineUrl = new URL('/api/stats/mine', req.url)
    if (ascension) mineUrl.searchParams.set('ascension', ascension)
    const mineRes = await fetch(mineUrl.toString())
    const mineData = await mineRes.json()
    return NextResponse.json(mineData)
  }

  // Build Spire Codex URL with optional ascension filter
  const codexUrl = new URL('https://spire-codex.com/api/runs/stats')
  if (ascension) codexUrl.searchParams.set('ascension', ascension)

  const res = await fetch(codexUrl.toString(), {
    next: { revalidate: 300 }
  })

  const data = await res.json()

  const pickRates: CardPickRate[] = data.pick_rates
  const topCards: CardTopStat[] = data.top_cards

  const statsMap: Record<string, CardStats> = {}

  for (const entry of pickRates) {
    statsMap[entry.card_id] = {
      pickRate: entry.pick_rate,
      offered: entry.offered,
      picked: entry.picked,
      war: 0,
      totalRunsWith: 0,
      winRuns: 0,
    }
  }

  for (const entry of topCards) {
    const war = entry.total_runs_with > 0
      ? Math.round((entry.win_runs / entry.total_runs_with) * 1000) / 10
      : 0

    if (statsMap[entry.card_id]) {
      statsMap[entry.card_id].war = war
      statsMap[entry.card_id].totalRunsWith = entry.total_runs_with
      statsMap[entry.card_id].winRuns = entry.win_runs
    } else {
      statsMap[entry.card_id] = {
        pickRate: 0,
        offered: 0,
        picked: 0,
        war,
        totalRunsWith: entry.total_runs_with,
        winRuns: entry.win_runs,
      }
    }
  }

  return NextResponse.json(statsMap)
}