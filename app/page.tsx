'use client'

import { useState, useEffect } from 'react'
import CardSlot from '@/components/CardSlot'
import { CardStats } from '@/app/api/stats/route'

export default function Home() {
  const [slots, setSlots] = useState([0, 1, 2])
  const [statsMap, setStatsMap] = useState<Record<string, CardStats>>({})

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        console.log('stats loaded:', Object.keys(data).length, 'cards')
        setStatsMap(data)
      })
      .catch(err => console.error('stats fetch failed:', err))
  }, [])

  function addSlot() {
    setSlots(prev => [...prev, prev.length])
  }

  function removeSlot(index: number) {
    setSlots(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <main
      className="min-h-screen bg-[#0d0d1a] px-6 py-8 max-w-4xl mx-auto"
      style={{ fontFamily: 'Kreon, serif' }}
    >
      <div className="mb-8 border-b border-[#c9a84c33] pb-4">
        <h1 className="text-[#c9a84c] text-2xl tracking-widest uppercase">
          Spire Scout
        </h1>
        <p className="text-[#4a4535] text-xs mt-1 font-mono">
          card comparison · a10
        </p>
      </div>

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