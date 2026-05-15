'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { format, isValid } from 'date-fns'
import { useLang } from '@/context/LangContext'

function EventCard({ event }: { event: Event }) {
  const date = event.event_date ? new Date(event.event_date) : null
  const validDate = date && isValid(date)

  return (
    <div
      className="group flex flex-col transition-all duration-300"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
    >
      {/* Thumbnail — 9:16 portrait on mobile, 16:9 landscape on sm+ */}
      <div className="relative overflow-hidden aspect-[9/16] sm:aspect-[16/9]" style={{ background: 'var(--surface-2)' }}>
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"
              style={{ color: 'var(--muted-2)', opacity: 0.4 }}>
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
              <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
              <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
            </svg>
          </div>
        )}

        {/* Upcoming badge */}
        {event.is_upcoming && (
          <span
            className="absolute top-3 right-3 text-xs font-black tracking-widest uppercase px-2 py-1"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Upcoming
          </span>
        )}

        {/* Gradient + date overlay */}
        {validDate && (
          <div
            className="absolute bottom-0 inset-x-0 px-4 py-3 flex items-end"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
          >
            <div>
              <div className="text-2xl font-black leading-none" style={{ color: 'var(--accent)' }}>
                {format(date, 'dd')}
              </div>
              <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.85)' }}>
                {format(date, 'MMM yyyy')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div>
          <h3 className="font-black mb-1 leading-tight" style={{ color: 'var(--text)', fontSize: '1rem' }}>
            {event.title}
          </h3>
          <p className="font-bold tracking-wider uppercase" style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>
            {event.venue} — {event.city}
          </p>
        </div>

        {event.description && (
          <p className="leading-relaxed flex-1" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            {event.description}
          </p>
        )}

        {event.genres && event.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {event.genres.map((g) => (
              <span
                key={g}
                className="font-bold tracking-wider px-2 py-0.5"
                style={{
                  background: 'var(--surface-2)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  fontSize: '0.65rem',
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
  const { t } = useLang()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })
      .then(({ data }) => {
        setEvents(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = events.filter((e) => {
    if (filter === 'upcoming') return e.is_upcoming
    if (filter === 'past') return !e.is_upcoming
    return true
  })

  return (
    <section id="events" className="py-24 px-9 min-h-screen" style={{ background: 'var(--surface)' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <p className="section-label mb-3">{t.events.label}</p>
            <div className="accent-line mb-5" />
            <h2
              className="font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', color: 'var(--text)' }}
            >
              {t.events.heading}
            </h2>
          </div>

          {!loading && events.length > 0 && (
            <div
              className="flex gap-1 p-1 self-start sm:self-auto"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              {(['all', 'upcoming', 'past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 font-black tracking-widest uppercase transition-all duration-200"
                  style={{
                    background: filter === f ? 'var(--accent)' : 'transparent',
                    color: filter === f ? '#fff' : 'var(--muted)',
                    fontSize: '0.7rem',
                  }}
                >
                  {f === 'all' ? t.events.all : f === 'upcoming' ? t.events.upcoming : t.events.past}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse aspect-[9/16] sm:aspect-[16/9]"
                style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-5" style={{ color: 'var(--muted-2)' }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="font-bold tracking-wider" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
              {t.events.noEvents}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            {t.events.noEvents}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
