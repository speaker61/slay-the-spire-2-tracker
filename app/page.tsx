'use client'

import { useState } from 'react'
import CardSlot from '@/components/CardSlot'

export default function Home() {
  const [slots, setSlots] = useState([0, 1, 2])

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
      {/* Header */}
      <div className="mb-8 border-b border-[#c9a84c33] pb-4">
        <h1 className="text-[#c9a84c] text-2xl tracking-widest uppercase">
          Spire Scout
        </h1>
        <p className="text-[#4a4535] text-xs mt-1 font-mono">
          card comparison · a10
        </p>
      </div>

      {/* Card slots */}
      <div>
        {slots.map((_, i) => (
          <CardSlot
            key={i}
            onRemove={() => removeSlot(i)}
          />
        ))}
      </div>

      {/* Add slot button */}
      <button
        onClick={addSlot}
        className="mt-4 text-[#4a4535] hover:text-[#c9a84c] text-xs font-mono tracking-widest uppercase transition-colors"
      >
        + add card
      </button>
    </main>
  )
}