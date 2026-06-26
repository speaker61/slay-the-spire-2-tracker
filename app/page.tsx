'use client'

import { useState, useEffect } from 'react'
import CardSlot from '@/components/CardSlot'
import { CardStats } from '@/app/api/stats/route'

type AscFilter = 'all' | 'a10'
type SourceFilter = 'codex' | 'spirebird' | 'mine'

export default function Home() {
  const [slots, setSlots] = useState([0, 1, 2])
  const [statsMap, setStatsMap] = useState<Record<string, CardStats>>({})
  const [ascFilter, setAscFilter] = useState<AscFilter>('all')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('codex')

  useEffect(() => {
    const params = new URLSearchParams()
    if (ascFilter === 'a10') params.set('ascension', '10')
    params.set('source', sourceFilter)

    fetch(`/api/stats?${params.toString()}`)
      .then(res => res.json())
      .then(data => setStatsMap(data))
      .catch(err => console.error('stats fetch failed:', err))
  }, [ascFilter, sourceFilter])

  function addSlot() {
    setSlots(prev => [...prev, prev.length])
  }

  function removeSlot(index: number) {
    setSlots(prev => prev.filter((_, i) => i !== index))
  }

  const toggleClass = (active: boolean) =>
    active
      ? 'px-3 py-1 text-xs font-mono border border-[#c9a84c] text-[#c9a84c] cursor-pointer'
      : 'px-3 py-1 text-xs font-mono border border-[#2a2a3a] text-[#4a4535] hover:border-[#c9a84c44] cursor-pointer transition-colors'

  return (
    <main
      className="min-h-screen bg-[#0d0d1a] px-6 py-8 max-w-4xl mx-auto"
      style={{ fontFamily: 'Kreon, serif' }}
    >
      {/* Header */}
      <div className="mb-6 border-b border-[#c9a84c33] pb-4">
        <h1 className="text-[#c9a84c] text-2xl tracking-widest uppercase">
          Spire Scout
        </h1>
        <p className="text-[#4a4535] text-xs mt-1 font-mono">
          card comparison
        </p>
      </div>

      {/* Toggles */}
      <div className="flex gap-6 mb-6">
        <div className="flex gap-1">
          <button className={toggleClass(ascFilter === 'all')} onClick={() => setAscFilter('all')}>All runs</button>
          <button className={toggleClass(ascFilter === 'a10')} onClick={() => setAscFilter('a10')}>A10</button>
        </div>
        <div className="flex gap-1">
          <button className={toggleClass(sourceFilter === 'codex')} onClick={() => setSourceFilter('codex')}>Spire Codex</button>
          <button className={toggleClass(sourceFilter === 'spirebird')} onClick={() => setSourceFilter('spirebird')}>Spire Bird</button>
          <button className={toggleClass(sourceFilter === 'mine')} onClick={() => setSourceFilter('mine')}>Mine</button>
        </div>
      </div>

      {/* Mine placeholder */}
      {sourceFilter === 'mine' && (
        <p className="text-[#4a4535] text-xs font-mono mb-4">
          personal stats — import your run files to populate
        </p>
      )}

      {/* Card slots */}
      <div>
        {slots.map((_, i) => (
          <CardSlot
            key={i}
            statsMap={statsMap}
            onRemove={() => removeSlot(i)}
          />
        ))}
      </div>

      <button
        onClick={addSlot}
        className="mt-4 text-[#4a4535] hover:text-[#c9a84c] text-xs font-mono tracking-widest uppercase transition-colors"
      >
        + add card
      </button>
    </main>
  )
}