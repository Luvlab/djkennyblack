'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { useLang } from '@/context/LangContext'
import { format, isValid } from 'date-fns'

const DEFAULT_GENRES = [
  'Deep House', 'Soul', 'Funk', 'Old School Hip Hop', 'Vinyl Only',
  'Electro', 'Boogie', 'Jazz-Funk', 'Tech House', 'Garage House',
  'G-Funk', 'Soulful House', 'Classic House', 'R&B', 'Afrobeat',
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { t } = useLang()
  const [genres, setGenres] = useState<string[]>(DEFAULT_GENRES)
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)

  useEffect(() => {
    // Pull genres from site_settings, then fall back to event genres, then to DEFAULT_GENRES
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['hero_genres'])
      .then(({ data }) => {
        const genreSetting = data?.find((d) => d.key === 'hero_genres')
        if (genreSetting?.value) {
          const list = genreSetting.value.split(',').map((g: string) => g.trim()).filter(Boolean)
          if (list.length > 0) setGenres(list)
        }
      })

    // Pull featured upcoming event + event genres as fallback
    supabase
      .from('events')
      .select('genres, is_featured, is_upcoming, title, venue, city, event_date')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return

        // Only override genres if site_settings gave us none (handled by ordering effects)
        const allGenres = new Set<string>()
        data.forEach((e) => e.genres?.forEach((g: string) => allGenres.add(g)))
        if (allGenres.size > 0) setGenres((prev) => (prev === DEFAULT_GENRES ? [...allGenres] : prev))

        const next = data.find((e) => e.is_upcoming && e.is_featured) || data.find((e) => e.is_upcoming)
        if (next) setFeaturedEvent(next as Event)
      })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let tick = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      tick += 0.015

      const bars = 80
      const barWidth = canvas.width / bars
      const centerY = canvas.height * 0.78

      for (let i = 0; i < bars; i++) {
        const x = i * barWidth
        const freq = Math.sin(i * 0.18 + tick) * Math.sin(i * 0.05 + tick * 0.7)
        const h = Math.abs(freq) * 120 + 4
        const alpha = 0.1 + Math.abs(freq) * 0.22
        ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`
        ctx.fillRect(x, centerY - h, barWidth - 1, h * 2)
      }

      animId = requestAnimationFrame(drawWaveform)
    }
    drawWaveform()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const featuredDate = featuredEvent?.event_date
    ? (() => { const d = new Date(featuredEvent.event_date); return isValid(d) ? d : null })()
    : null

  const ticker = [...genres, ...genres]

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden grain"
      style={{ background: 'var(--bg)' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.55 }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(255,69,0,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-5 sm:px-8 pt-32 pb-16 flex flex-col items-center text-center">

        <div className="section-label mb-6 flex items-center gap-3">
          <span className="accent-line" />
          {t.hero.location}
          <span className="accent-line" />
        </div>

        <h1
          className="font-black leading-none tracking-tight mb-4"
          style={{
            fontSize: 'clamp(3.5rem, 16vw, 11rem)',
            color: 'var(--text)',
            letterSpacing: '-0.03em',
          }}
        >
          KENNY
          <br />
          <span style={{ color: 'var(--accent)' }} className="text-glow">
            BLACK
          </span>
        </h1>

        <p
          className="font-bold mb-2 tracking-wider"
          style={{
            fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
            color: 'var(--muted)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          {t.hero.tagline}
        </p>

        <p
          className="max-w-lg mb-10 leading-relaxed"
          style={{ color: 'var(--muted)', fontSize: '1rem' }}
        >
          {t.hero.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
          <a
            href="/#book"
            className="px-10 py-8 font-black tracking-widest uppercase transition-all duration-200 glow-accent flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.8rem' }}
          >
            {t.hero.bookCta}
          </a>
          <a
            href="/#about"
            className="px-10 py-8 font-black tracking-widest uppercase border-2 transition-all duration-200 flex items-center justify-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'transparent', fontSize: '0.8rem' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}
          >
            {t.hero.learnMore}
          </a>
        </div>

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-3 gap-8 w-full max-w-sm border-t pt-8"
          style={{ borderColor: 'var(--border)' }}
        >
          {[
            { value: '40+', label: t.hero.stats.years },
            { value: '1982', label: t.hero.stats.since },
            { value: 'Vinyl', label: t.hero.stats.vinyl },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-black text-2xl" style={{ color: 'var(--accent)' }}>
                {stat.value}
              </span>
              <span
                className="tracking-widest uppercase mt-1"
                style={{ color: 'var(--muted)', fontSize: '0.65rem' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Featured upcoming event */}
        {featuredEvent && (
          <a
            href="/#events"
            className="mt-10 flex items-center gap-4 px-5 py-3 border-l-2 text-left w-full max-w-sm transition-all duration-200"
            style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
          >
            {featuredDate && (
              <div className="flex-shrink-0 text-center" style={{ minWidth: '2.5rem' }}>
                <div className="font-black text-xl leading-none" style={{ color: 'var(--accent)' }}>
                  {format(featuredDate, 'dd')}
                </div>
                <div className="font-bold tracking-widest uppercase" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                  {format(featuredDate, 'MMM')}
                </div>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-black uppercase tracking-wider truncate" style={{ color: 'var(--text)', fontSize: '0.75rem' }}>
                {featuredEvent.title}
              </p>
              <p className="truncate" style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>
                {featuredEvent.venue} · {featuredEvent.city}
              </p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="flex-shrink-0 ml-auto" style={{ color: 'var(--accent)' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>

      {/* Genre ticker */}
      <div
        className="relative z-10 overflow-hidden border-t border-b py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="ticker-track flex gap-8 whitespace-nowrap w-max">
          {ticker.map((g, i) => (
            <span
              key={i}
              className="font-black tracking-widest uppercase flex items-center gap-8"
              style={{ color: 'var(--muted-2)', fontSize: '0.65rem' }}
            >
              {g}
              <span style={{ color: 'var(--accent)', fontSize: '0.4rem' }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
