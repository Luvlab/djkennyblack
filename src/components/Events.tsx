'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { format } from 'date-fns'

const fallbackEvents: Event[] = [
  { id: '1', title: 'After Work Vibes', venue: 'Elite Hotel Marina Tower', city: 'Stockholm', event_date: '2023-09-15', description: 'A soulful after-work session at one of Stockholm\'s premier waterfront hotels. Soul, funk, and boogie all night.', image_url: null, genres: ['Soul', 'Funk', 'Boogie'], is_upcoming: false, is_featured: true, created_at: '' },
  { id: '2', title: 'Vinyl vid Vattnet', venue: 'Café Cul De Sac', city: 'Gröndal, Stockholm', event_date: '2024-06-15', description: 'Outdoor vinyl session by the water. Pure analogue sound in a stunning setting.', image_url: null, genres: ['House', 'Soul', 'Funk'], is_upcoming: false, is_featured: false, created_at: '' },
  { id: '3', title: '8 Timmar Musik på Vinyl', venue: 'Medborgarplatsen', city: 'Stockholm', event_date: '2024-08-10', description: 'Eight straight hours of vinyl music — an endurance set spanning five decades of black music.', image_url: null, genres: ['Funk', 'Soul', 'Hip Hop', 'House'], is_upcoming: false, is_featured: true, created_at: '' },
  { id: '4', title: 'Soul Corner Sessions', venue: 'Berns Salonger', city: 'Stockholm', event_date: '2025-02-14', description: 'Valentine\'s Day soul and jazz-funk session at the iconic Berns.', image_url: null, genres: ['Soul', 'Jazz-Funk', 'R&B'], is_upcoming: false, is_featured: true, created_at: '' },
  { id: '5', title: 'Klubbliv Mixtape Live', venue: 'Slakthuset', city: 'Stockholm', event_date: '2024-11-22', description: 'Live recording of the Klubbliv Mixtape series. Deep house and tech house in an underground setting.', image_url: null, genres: ['Deep House', 'Tech House'], is_upcoming: false, is_featured: false, created_at: '' },
]

function EventCard({ event }: { event: Event }) {
  const date = new Date(event.event_date)

  return (
    <div
      className="group relative overflow-hidden transition-all duration-300"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '2px',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--accent)'
        el.style.background = 'var(--surface-2)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.background = 'var(--surface)'
      }}
    >
      {/* Date bar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="text-center"
            style={{ minWidth: '2.5rem' }}
          >
            <div
              className="text-lg font-black leading-none"
              style={{ color: 'var(--accent)' }}
            >
              {format(date, 'dd')}
            </div>
            <div
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: 'var(--muted)' }}
            >
              {format(date, 'MMM')}
            </div>
          </div>
          <div
            className="w-px h-8"
            style={{ background: 'var(--border)' }}
          />
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: 'var(--muted-2)' }}
            >
              {format(date, 'yyyy')}
            </p>
          </div>
        </div>

        {event.is_upcoming && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded tracking-wider"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Upcoming
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-bold text-base mb-1"
          style={{ color: 'var(--text)' }}
        >
          {event.title}
        </h3>
        <p
          className="text-xs font-semibold tracking-wider uppercase mb-3"
          style={{ color: 'var(--muted)' }}
        >
          {event.venue} — {event.city}
        </p>
        {event.description && (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--muted)' }}
          >
            {event.description}
          </p>
        )}

        {/* Genre tags */}
        {event.genres && event.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.genres.map((g) => (
              <span
                key={g}
                className="text-xs px-2 py-0.5 rounded-sm font-bold tracking-wider"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>(fallbackEvents)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setEvents(data)
      })
  }, [])

  const filtered = events.filter((e) => {
    if (filter === 'upcoming') return e.is_upcoming
    if (filter === 'past') return !e.is_upcoming
    return true
  })

  return (
    <section
      id="events"
      className="py-24 px-4"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6">
          <div>
            <p className="section-label mb-3">Events</p>
            <div className="accent-line mb-4" />
            <h2
              className="font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--text)' }}
            >
              On the Decks
            </h2>
          </div>

          {/* Filter tabs */}
          <div
            className="flex gap-1 p-1 rounded self-start sm:self-auto"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded transition-all duration-200"
                style={{
                  background: filter === f ? 'var(--accent)' : 'transparent',
                  color: filter === f ? '#fff' : 'var(--muted)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Events grid */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: 'var(--muted)' }}>
            No events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
