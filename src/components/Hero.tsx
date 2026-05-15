'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { useLang } from '@/context/LangContext'
import { format, isValid } from 'date-fns'

type HeroBg = 'spectrum' | 'images' | 'film'

const DEFAULT_GENRES = [
  'Deep House', 'Soul', 'Funk', 'Old School Hip Hop', 'Vinyl Only',
  'Electro', 'Boogie', 'Jazz-Funk', 'Tech House', 'Garage House',
  'G-Funk', 'Soulful House', 'Classic House', 'R&B', 'Afrobeat',
]

// 80 bars across 7 frequency bands — logarithmically distributed
// [barCount, maxAmplitude, noiseSpeed, smoothing]
const SPEC_BANDS = [
  { count: 6,  amp: 0.90, ny: 0.46, smooth: 0.93 }, // sub-bass: massive, glacial
  { count: 10, amp: 0.76, ny: 0.74, smooth: 0.88 }, // bass
  { count: 14, amp: 0.59, ny: 1.10, smooth: 0.82 }, // low-mid
  { count: 18, amp: 0.42, ny: 1.65, smooth: 0.75 }, // mid
  { count: 16, amp: 0.26, ny: 2.35, smooth: 0.67 }, // high-mid
  { count: 10, amp: 0.14, ny: 3.50, smooth: 0.58 }, // presence
  { count: 6,  amp: 0.07, ny: 5.20, smooth: 0.49 }, // brilliance: tiny, jittery
] // Total: 80 bars

// Frequency → RGB colour. t=0 (sub-bass, orange-red) → t=1 (brilliance, ice-white)
function specRGB(t: number): [number, number, number] {
  if (t < 0.20) {
    // sub-bass: deep crimson → accent orange-red
    const u = t / 0.20
    return [Math.round(180 + u * 75), Math.round(u * 69), 0]
  } else if (t < 0.40) {
    // bass: orange-red → orange
    const u = (t - 0.20) / 0.20
    return [255, Math.round(69 + u * 96), 0]
  } else if (t < 0.60) {
    // low-mid → mid: orange → gold/yellow
    const u = (t - 0.40) / 0.20
    return [255, Math.round(165 + u * 55), Math.round(u * 20)]
  } else if (t < 0.80) {
    // high-mid: yellow → yellow-cyan
    const u = (t - 0.60) / 0.20
    return [Math.round(255 - u * 55), 220, Math.round(u * 160)]
  } else {
    // presence → brilliance: cyan → ice white
    const u = (t - 0.80) / 0.20
    return [Math.round(200 + u * 55), Math.round(220 + u * 35), Math.round(160 + u * 95)]
  }
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const { t } = useLang()

  const [bgMode, setBgMode] = useState<HeroBg>('spectrum')
  const bgModeRef = useRef<HeroBg>('spectrum')

  const [genres, setGenres] = useState<string[]>(DEFAULT_GENRES)
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [heroVideo, setHeroVideo] = useState<string | null>(null)
  const [slideIdx, setSlideIdx] = useState(0)

  const totalBars = SPEC_BANDS.reduce((s, b) => s + b.count, 0) // 80
  const levelsRef = useRef<number[]>(Array.from({ length: totalBars }, () => 0.02))
  const phasesRef = useRef<number[]>(Array.from({ length: totalBars }, (_, i) => i * 1.618))

  useEffect(() => { bgModeRef.current = bgMode }, [bgMode])

  // Load site data + assets
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['hero_genres', 'hero_images', 'hero_video'])
      .then(({ data }) => {
        data?.forEach((d) => {
          if (d.key === 'hero_genres' && d.value) {
            const list = d.value.split(',').map((g: string) => g.trim()).filter(Boolean)
            if (list.length > 0) setGenres(list)
          }
          if (d.key === 'hero_images' && d.value) {
            setHeroImages(d.value.split(',').map((u: string) => u.trim()).filter(Boolean))
          }
          if (d.key === 'hero_video' && d.value) {
            setHeroVideo(d.value)
          }
        })
      })

    supabase
      .from('events')
      .select('genres, is_featured, is_upcoming, title, venue, city, event_date, image_url')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return
        const allGenres = new Set<string>()
        data.forEach((e) => e.genres?.forEach((g: string) => allGenres.add(g)))
        if (allGenres.size > 0)
          setGenres((prev) => (prev === DEFAULT_GENRES ? [...allGenres] : prev))
        const next =
          data.find((e) => e.is_upcoming && e.is_featured) || data.find((e) => e.is_upcoming)
        if (next) setFeaturedEvent(next as Event)
        // Use event image_urls as fallback for image slideshow
        const imgs = data.filter((e) => e.image_url).map((e) => e.image_url as string)
        if (imgs.length > 0) setHeroImages((prev) => (prev.length === 0 ? imgs : prev))
      })
  }, [])

  // Image slideshow timer
  useEffect(() => {
    if (bgMode !== 'images' || heroImages.length < 2) return
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % heroImages.length), 5000)
    return () => clearInterval(id)
  }, [bgMode, heroImages])

  // Spectrum canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let tick = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height

      if (bgModeRef.current !== 'spectrum') {
        ctx.clearRect(0, 0, W, H)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, W, H)
      tick += 0.020

      const n = totalBars
      const slot = W / n
      const barW = Math.max(1, slot * 0.62)
      const gap = slot - barW

      let bandStart = 0

      SPEC_BANDS.forEach((band) => {
        for (let b = 0; b < band.count; b++) {
          const i = bandStart + b
          const tPos = i / (n - 1) // 0=bass, 1=treble

          // Perlin-like noise — three orthogonal sines, per-bar phase offset
          const ph = phasesRef.current[i]
          const noise =
            Math.sin(tick * band.ny + ph) *
            Math.cos(tick * band.ny * 0.71 + ph * 1.37) *
            Math.sin(tick * band.ny * 0.43 + b * 0.88 + ph * 0.8)

          const target = band.amp * (0.06 + 0.94 * Math.abs(noise))

          const diff = target - levelsRef.current[i]
          levelsRef.current[i] +=
            diff > 0
              ? diff * (1 - band.smooth) * 3.5  // fast attack
              : diff * (1 - band.smooth)          // slow release

          levelsRef.current[i] = Math.max(0.02, Math.min(1, levelsRef.current[i]))

          const lvl = levelsRef.current[i]
          const x = i * slot + gap * 0.5
          const barH = lvl * H * 0.75
          const [r, g, bl] = specRGB(tPos)

          // — Main bar: vertical gradient, top transparent → bottom solid-ish
          const alpha = 0.15 + lvl * 0.35
          const grad = ctx.createLinearGradient(0, H - barH, 0, H)
          grad.addColorStop(0,   `rgba(${r},${g},${bl},${(alpha * 0.9).toFixed(3)})`)
          grad.addColorStop(0.5, `rgba(${r},${g},${bl},${(alpha * 0.55).toFixed(3)})`)
          grad.addColorStop(1,   `rgba(${r},${g},${bl},${(alpha * 0.08).toFixed(3)})`)
          ctx.fillStyle = grad
          ctx.fillRect(x, H - barH, barW, barH)

          // — Glowing peak cap (only for louder bars)
          if (lvl > 0.30) {
            const peakA = (lvl - 0.30) * 0.55
            ctx.save()
            ctx.shadowColor = `rgba(${r},${g},${bl},${peakA})`
            ctx.shadowBlur = 16
            ctx.fillStyle = `rgba(${r},${g},${bl},${(peakA * 1.8).toFixed(3)})`
            ctx.fillRect(x, H - barH - 1, barW, 2.5)
            ctx.restore()
          }

          // — Floor reflection (short, fast fade)
          const refGrad = ctx.createLinearGradient(0, H, 0, H + barH * 0.28)
          refGrad.addColorStop(0, `rgba(${r},${g},${bl},${(alpha * 0.22).toFixed(3)})`)
          refGrad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
          ctx.fillStyle = refGrad
          ctx.fillRect(x, H, barW, barH * 0.28)
        }
        bandStart += band.count
      })

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [totalBars])

  const featuredDate = featuredEvent?.event_date
    ? (() => { const d = new Date(featuredEvent.event_date); return isValid(d) ? d : null })()
    : null

  const ticker = [...genres, ...genres]

  // Background mode buttons
  const bgButtons: { mode: HeroBg; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'spectrum',
      label: 'Spectrum',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="20" x2="4" y2="10"/>
          <line x1="8" y1="20" x2="8" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="14"/>
          <line x1="16" y1="20" x2="16" y2="6"/>
          <line x1="20" y1="20" x2="20" y2="12"/>
        </svg>
      ),
    },
    {
      mode: 'images',
      label: 'Photos',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      ),
    },
    {
      mode: 'film',
      label: 'Film',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="2"/>
          <line x1="7" y1="2" x2="7" y2="22"/>
          <line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="7" x2="7" y2="7"/>
          <line x1="17" y1="7" x2="22" y2="7"/>
          <line x1="2" y1="12" x2="7" y2="12"/>
          <line x1="17" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/>
        </svg>
      ),
    },
  ]

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col overflow-hidden grain pt-12"
      style={{ background: 'var(--bg)' }}
    >
      {/* ── Spectrum canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: bgMode === 'spectrum' ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── Image slideshow ── */}
      {heroImages.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgMode === 'images' && i === slideIdx ? 0.42 : 0,
            transition: 'opacity 1.4s ease',
            pointerEvents: 'none',
          }}
        />
      ))}
      {bgMode === 'images' && heroImages.length === 0 && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,69,0,0.12) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Film / video ── */}
      {bgMode === 'film' && heroVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          style={{ opacity: 0.45, pointerEvents: 'none' }}
        />
      )}
      {bgMode === 'film' && !heroVideo && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <p
            className="font-black tracking-widest uppercase"
            style={{ color: 'var(--muted-2)', fontSize: '0.6rem' }}
          >
            No video — add <code>hero_video</code> in site settings
          </p>
        </div>
      )}

      {/* ── Radial glow overlay (always) ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 55%, rgba(255,69,0,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Genre ticker — directly under nav ── */}
      <div
        className="relative z-10 overflow-hidden border-b py-3"
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

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 max-w-screen-xl mx-auto w-full px-9 pb-[168px] flex flex-col items-center justify-center text-center">

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
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
              background: 'transparent',
              fontSize: '0.8rem',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            }}
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
            { value: '40+',   label: t.hero.stats.years },
            { value: '1982',  label: t.hero.stats.since },
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
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface)'
            }}
          >
            {featuredDate && (
              <div className="flex-shrink-0 text-center" style={{ minWidth: '2.5rem' }}>
                <div
                  className="font-black text-xl leading-none"
                  style={{ color: 'var(--accent)' }}
                >
                  {format(featuredDate, 'dd')}
                </div>
                <div
                  className="font-bold tracking-widest uppercase"
                  style={{ color: 'var(--muted)', fontSize: '0.6rem' }}
                >
                  {format(featuredDate, 'MMM')}
                </div>
              </div>
            )}
            <div className="min-w-0">
              <p
                className="font-black uppercase tracking-wider truncate"
                style={{ color: 'var(--text)', fontSize: '0.75rem' }}
              >
                {featuredEvent.title}
              </p>
              <p className="truncate" style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>
                {featuredEvent.venue} · {featuredEvent.city}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="flex-shrink-0 ml-auto"
              style={{ color: 'var(--accent)' }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>

      {/* ── Background mode switcher ── */}
      <div className="absolute bottom-44 right-9 z-20 flex flex-col gap-1.5">
        {bgButtons.map(({ mode, label, icon }) => {
          const active = bgMode === mode
          return (
            <button
              key={mode}
              onClick={() => setBgMode(mode)}
              title={label}
              className="flex items-center justify-center transition-all duration-200"
              style={{
                width: '34px',
                height: '34px',
                background: active
                  ? 'var(--accent)'
                  : 'color-mix(in srgb, var(--bg) 75%, transparent)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                color: active ? '#fff' : 'var(--muted)',
                backdropFilter: 'blur(8px)',
                boxShadow: active ? '0 0 12px var(--accent-glow)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
                }
              }}
            >
              {icon}
            </button>
          )
        })}
      </div>

      {/* Image slideshow dots (when in images mode with multiple images) */}
      {bgMode === 'images' && heroImages.length > 1 && (
        <div className="absolute bottom-44 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className="transition-all duration-300"
              style={{
                width: i === slideIdx ? '20px' : '6px',
                height: '6px',
                background: i === slideIdx ? 'var(--accent)' : 'var(--muted-2)',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
