'use client'

import { useState, useEffect, useRef } from 'react'
import { CardStats } from '@/app/api/stats/route'

type Card = {
  id: string
  name: string
  character: string | null
  rarity: string
  type: string
  cost: number | null
  isXCost: boolean
  keywords: string[]
  imageUrl: string | null
}

type Stats = {
  pickRate: string
  war: string
  warA1: string
  warA2: string
  warA3: string
  elo: string
}

const EMPTY_STATS: Stats = {
  pickRate: '—',
  war: '—',
  warA1: '—',
  warA2: '—',
  warA3: '—',
  elo: '—',
}

export default function CardSlot({ onRemove, statsMap = {} }: { onRemove: () => void, statsMap: Record<string, CardStats> }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Card[]>([])
  const [selected, setSelected] = useState<Card | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/cards?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.slice(0, 8))
    }, 300)
  }, [query])

  function selectCard(card: Card) {
    setSelected(card)
    setQuery(card.name)
    setShowDropdown(false)
    setResults([])
  }

  function clear() {
    setSelected(null)
    setQuery('')
    setResults([])
  }

  const rawStats = selected ? statsMap[selected.id] : null

  const stats = rawStats
    ? {
        pickRate: `${rawStats.pickRate}% (${rawStats.picked}/${rawStats.offered})`,
        war: `${rawStats.war}%  (${rawStats.winRuns}/${rawStats.totalRunsWith})`,
        warA1: '—',
        warA2: '—',
        warA3: '—',
        elo: '—',
      }
    : EMPTY_STATS

  return (
    <div className="relative border-b border-[#c9a84c33] py-3 px-2">

      {/* Search */}
      {!selected && (
        <div className="relative">
          <input
            className="w-full bg-transparent border-b border-[#c9a84c66] text-[#e8e0d0] placeholder-[#4a4535] outline-none pb-1 text-sm"
            placeholder="Search card..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          />
          {showDropdown && results.length > 0 && (
            <ul className="absolute z-10 w-full bg-[#0f0f1e] border border-[#c9a84c33] mt-1 max-h-48 overflow-y-auto">
              {results.map(card => (
                <li
                  key={card.id}
                  className="px-3 py-2 hover:bg-[#c9a84c11] cursor-pointer flex justify-between items-center"
                  onMouseDown={() => selectCard(card)}
                >
                  <span className="text-[#e8e0d0] text-sm">{card.name}</span>
                  <span className="text-[#4a4535] text-xs">{card.character ?? 'Neutral'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected card row */}
      {selected && (
        <div className="flex items-center gap-6">

          {/* Card name — click for popup */}
          <button
            onClick={() => setShowPopup(true)}
            className="text-[#c9a84c] text-sm font-bold hover:underline text-left w-40 shrink-0 truncate"
            style={{ fontFamily: 'Kreon, serif' }}
          >
            {selected.name}
          </button>

          {/* Character tag */}
          <span className="text-[#4a4535] text-xs w-20 shrink-0">
            {selected.character ?? 'Neutral'}
          </span>

          {/* Stats */}
          <div className="flex gap-5 text-sm font-mono flex-1">
            <span>
              <span className="text-[#4a4535] text-xs">PR </span>
              <span className="text-[#e8e0d0]">{stats.pickRate}</span>
            </span>
            <span>
              <span className="text-[#4a4535] text-xs">WAR </span>
              <span className="text-[#e8e0d0]">{stats.war}</span>
            </span>
            <span>
              <span className="text-[#4a4535] text-xs">A1 </span>
              <span className="text-[#e8e0d0]">{stats.warA1}</span>
            </span>
            <span>
              <span className="text-[#4a4535] text-xs">A2 </span>
              <span className="text-[#e8e0d0]">{stats.warA2}</span>
            </span>
            <span>
              <span className="text-[#4a4535] text-xs">A3 </span>
              <span className="text-[#e8e0d0]">{stats.warA3}</span>
            </span>
            <span>
              <span className="text-[#4a4535] text-xs">ELO </span>
              <span className="text-[#e8e0d0]">{stats.elo}</span>
            </span>
          </div>

          {/* Clear */}
          <button
            onClick={clear}
            className="text-[#4a4535] hover:text-[#e8e0d0] text-xs ml-auto shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Remove slot */}
      {selected && (
        <button
          onClick={onRemove}
          className="absolute right-2 top-1 text-[#2a2a3a] hover:text-[#c9a84c33] text-xs"
        >
          remove
        </button>
      )}

      {/* Popup */}
      {showPopup && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-[#0f0f1e] border border-[#c9a84c33] p-6 w-80"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2
                className="text-[#c9a84c] text-lg"
                style={{ fontFamily: 'Kreon, serif' }}
              >
                {selected.name}
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-[#4a4535] hover:text-[#e8e0d0] text-sm"
              >
                ✕
              </button>
            </div>

            {selected.imageUrl && (
              <img
                src={`https://spire-codex.com${selected.imageUrl}`}
                alt={selected.name}
                className="w-full mb-4 border border-[#c9a84c22]"
              />
            )}

            <div className="text-sm space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-[#4a4535]">Character</span>
                <span className="text-[#e8e0d0]">{selected.character ?? 'Neutral'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4535]">Rarity</span>
                <span className="text-[#e8e0d0]">{selected.rarity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4535]">Type</span>
                <span className="text-[#e8e0d0]">{selected.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4535]">Cost</span>
                <span className="text-[#e8e0d0]">{selected.isXCost ? 'X' : (selected.cost ?? '?')}</span>
              </div>
              {selected.keywords.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#4a4535]">Keywords</span>
                  <span className="text-[#e8e0d0] text-right">{selected.keywords.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#c9a84c22] text-sm font-mono space-y-1">
              <div className="text-[#4a4535] text-xs mb-2 uppercase tracking-widest">Stats</div>
              {[
                ['Pick Rate', stats.pickRate],
                ['WAR', stats.war],
                ['WAR Act 1', stats.warA1],
                ['WAR Act 2', stats.warA2],
                ['WAR Act 3', stats.warA3],
                ['ELO', stats.elo],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#4a4535]">{label}</span>
                  <span className="text-[#c9a84c]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}