'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const DEFAULT_GENRES = [
  'Deep House', 'Soul', 'Funk', 'Old School Hip Hop', 'Vinyl Only',
  'Electro', 'Boogie', 'Jazz-Funk', 'Tech House', 'Garage House',
  'G-Funk', 'Soulful House', 'Classic House', 'R&B', 'Afrobeat',
]

export default function TickerTape() {
  const [genres, setGenres] = useState<string[]>(DEFAULT_GENRES)

  useEffect(() => {
    supabase.from('site_settings').select('key, value').eq('key', 'hero_genres')
      .then(({ data }) => {
        const val = data?.[0]?.value
        if (val) {
          const list = val.split(',').map((g: string) => g.trim()).filter(Boolean)
          if (list.length > 0) setGenres(list)
        }
      })
  }, [])

  const ticker = [...genres, ...genres]

  return (
    <div
      className="fixed left-0 right-0 z-[41] overflow-hidden border-t py-3"
      style={{
        bottom: '120px',
        background: 'color-mix(in srgb, var(--bg) 90%, transparent)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="ticker-track flex gap-8 whitespace-nowrap w-max">
        {ticker.map((g, i) => (
          <span
            key={i}
            className="font-black tracking-widest uppercase flex items-center gap-8"
            style={{ color: 'var(--text)', fontSize: '0.65rem' }}
          >
            {g}
            <span style={{ color: 'var(--accent)', fontSize: '0.4rem' }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  )
}
