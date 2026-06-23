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

export async function GET() {
  const res = await fetch('https://spire-codex.com/api/runs/stats', {
    next: { revalidate: 300 } // cache for 5 minutes
  })

  const data = await res.json()

  const pickRates: CardPickRate[] = data.pick_rates
  const topCards: CardTopStat[] = data.top_cards

  // Build lookup map keyed by card_id
  const statsMap: Record<string, CardStats> = {}

  // Add pick rate data
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

  // Merge in WAR data
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
        offered: 0, //not available from top_cards
        picked: 0,
        war,
        totalRunsWith: entry.total_runs_with,
        winRuns: entry.win_runs,
      }
    }
  }

  return NextResponse.json(statsMap)
}