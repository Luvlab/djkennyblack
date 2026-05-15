'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { useLang } from '@/context/LangContext'
import { format, isValid } from 'date-fns'

type HeroBg = 'spectrum' | 'images'
type MicState = 'idle' | 'requesting' | 'active' | 'denied'

const DEFAULT_GENRES = [
  'Deep House', 'Soul', 'Funk', 'Old School Hip Hop', 'Vinyl Only',
  'Electro', 'Boogie', 'Jazz-Funk', 'Tech House', 'Garage House',
  'G-Funk', 'Soulful House', 'Classic House', 'R&B', 'Afrobeat',
]

// Fallback simulation: 80 bars across 7 frequency bands
const SPEC_BANDS = [
  { count: 6,  amp: 0.90, ny: 0.46, smooth: 0.93 },
  { count: 10, amp: 0.76, ny: 0.74, smooth: 0.88 },
  { count: 14, amp: 0.59, ny: 1.10, smooth: 0.82 },
  { count: 18, amp: 0.42, ny: 1.65, smooth: 0.75 },
  { count: 16, amp: 0.26, ny: 2.35, smooth: 0.67 },
  { count: 10, amp: 0.14, ny: 3.50, smooth: 0.58 },
  { count: 6,  amp: 0.07, ny: 5.20, smooth: 0.49 },
]
const TOTAL_BARS = SPEC_BANDS.reduce((s, b) => s + b.count, 0) // 80

// Frequency → RGB: deep crimson (sub-bass) → orange → gold → cyan → ice white (brilliance)
function specRGB(t: number): [number, number, number] {
  if (t < 0.20) {
    const u = t / 0.20
    return [Math.round(180 + u * 75), Math.round(u * 69), 0]
  } else if (t < 0.40) {
    const u = (t - 0.20) / 0.20
    return [255, Math.round(69 + u * 96), 0]
  } else if (t < 0.60) {
    const u = (t - 0.40) / 0.20
    return [255, Math.round(165 + u * 55), Math.round(u * 20)]
  } else if (t < 0.80) {
    const u = (t - 0.60) / 0.20
    return [Math.round(255 - u * 55), 220, Math.round(u * 160)]
  } else {
    const u = (t - 0.80) / 0.20
    return [Math.round(200 + u * 55), Math.round(220 + u * 35), Math.round(160 + u * 95)]
  }
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const { t } = useLang()

  // Background mode — only 2 choices
  const [bgMode, setBgMode] = useState<HeroBg>('spectrum')
  const bgModeRef = useRef<HeroBg>('spectrum')

  // ── Real microphone / Web Audio API ──────────────────────────────────────
  const [micState, setMicState] = useState<MicState>('idle')
  const micStateRef = useRef<MicState>('idle')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  const activateMic = async () => {
    setMicState('requesting')
    micStateRef.current = 'requesting'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const analyser = ctx.createAnalyser()
      // fftSize 8192 → 4096 bins → ~5.4 Hz/bin at 44100 Hz — proper sub-bass resolution
      analyser.fftSize = 8192
      analyser.smoothingTimeConstant = 0.80
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      ctx.createMediaStreamSource(stream).connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      freqDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))
      micStreamRef.current = stream
      setMicState('active')
      micStateRef.current = 'active'
    } catch {
      setMicState('denied')
      micStateRef.current = 'denied'
    }
  }

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
      audioCtxRef.current?.close()
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  // ── Simulation state (fallback when mic is off) ───────────────────────────
  const simLevelsRef = useRef<number[]>(Array.from({ length: TOTAL_BARS }, () => 0.02))
  const phasesRef    = useRef<number[]>(Array.from({ length: TOTAL_BARS }, (_, i) => i * 1.618))

  // ── Per-bar smoothed display levels (used for both mic + simulation) ──────
  const displayRef = useRef<number[]>(Array.from({ length: TOTAL_BARS }, () => 0.02))

  // ── Content data ──────────────────────────────────────────────────────────
  const [genres, setGenres]             = useState<string[]>(DEFAULT_GENRES)
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)
  const [heroImages, setHeroImages]     = useState<string[]>([])
  const [slideIdx, setSlideIdx]         = useState(0)

  useEffect(() => { bgModeRef.current = bgMode }, [bgMode])
  useEffect(() => { micStateRef.current = micState }, [micState])

  // Load DB data
  useEffect(() => {
    supabase.from('site_settings').select('key, value').in('key', ['hero_genres', 'hero_images'])
      .then(({ data }) => {
        data?.forEach((d) => {
          if (d.key === 'hero_genres' && d.value) {
            const list = d.value.split(',').map((g: string) => g.trim()).filter(Boolean)
            if (list.length > 0) setGenres(list)
          }
          if (d.key === 'hero_images' && d.value) {
            setHeroImages(d.value.split(',').map((u: string) => u.trim()).filter(Boolean))
          }
        })
      })
    supabase.from('events')
      .select('genres, is_featured, is_upcoming, title, venue, city, event_date, image_url')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        if (!data?.length) return
        const allGenres = new Set<string>()
        data.forEach((e) => e.genres?.forEach((g: string) => allGenres.add(g)))
        if (allGenres.size > 0)
          setGenres((prev) => (prev === DEFAULT_GENRES ? [...allGenres] : prev))
        const next = data.find((e) => e.is_upcoming && e.is_featured) || data.find((e) => e.is_upcoming)
        if (next) setFeaturedEvent(next as Event)
        const imgs = data.filter((e) => e.image_url).map((e) => e.image_url as string)
        if (imgs.length > 0) setHeroImages((prev) => (prev.length === 0 ? imgs : prev))
      })
  }, [])

  // Slideshow timer
  useEffect(() => {
    if (bgMode !== 'images' || heroImages.length < 2) return
    const id = setInterval(() => setSlideIdx((i) => (i + 1) % heroImages.length), 5000)
    return () => clearInterval(id)
  }, [bgMode, heroImages])

  // ── Canvas spectrum animation ─────────────────────────────────────────────
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

      const useMic = micStateRef.current === 'active' && analyserRef.current && freqDataRef.current
      const sampleRate = audioCtxRef.current?.sampleRate ?? 44100
      const nyquist    = sampleRate / 2

      // Snapshot frequency data once per frame
      if (useMic) analyserRef.current!.getByteFrequencyData(freqDataRef.current!)

      const n    = TOTAL_BARS
      const slot = W / n
      const barW = Math.max(1, slot * 0.62)
      const gap  = slot - barW

      let bandStart = 0

      SPEC_BANDS.forEach((band) => {
        for (let b = 0; b < band.count; b++) {
          const i    = bandStart + b
          const tPos = i / (n - 1)  // 0 = sub-bass, 1 = brilliance

          let target: number

          if (useMic) {
            // ── Real microphone path ──────────────────────────────────────
            // Map bar index to frequency (logarithmic: 20 Hz → 20 000 Hz)
            const freq    = 20 * Math.pow(1000, tPos)
            const numBins = freqDataRef.current!.length
            const bin     = Math.min(Math.round((freq / nyquist) * numBins), numBins - 1)
            target = freqDataRef.current![bin] / 255

            // Apply per-bar exponential smoothing on top of analyser smoothing
            const diff = target - displayRef.current[i]
            displayRef.current[i] += diff > 0
              ? diff * 0.60   // fast attack
              : diff * 0.15   // slow release
          } else {
            // ── Simulation fallback ───────────────────────────────────────
            const ph    = phasesRef.current[i]
            const noise = Math.sin(tick * band.ny + ph) *
                          Math.cos(tick * band.ny * 0.71 + ph * 1.37) *
                          Math.sin(tick * band.ny * 0.43 + b * 0.88 + ph * 0.8)
            target = band.amp * (0.06 + 0.94 * Math.abs(noise))
            simLevelsRef.current[i] += (target - simLevelsRef.current[i]) * (
              target > simLevelsRef.current[i]
                ? (1 - band.smooth) * 3.5
                : (1 - band.smooth)
            )
            simLevelsRef.current[i] = Math.max(0.02, Math.min(1, simLevelsRef.current[i]))
            displayRef.current[i]   = simLevelsRef.current[i]
          }

          const lvl = Math.max(0, Math.min(1, displayRef.current[i]))
          const x   = i * slot + gap * 0.5
          const barH = lvl * H * 0.75
          const [r, g, bl] = specRGB(tPos)

          // Main bar — vertical gradient, bright at top, dim at base
          const alpha = 0.15 + lvl * 0.38
          const grad  = ctx.createLinearGradient(0, H - barH, 0, H)
          grad.addColorStop(0,   `rgba(${r},${g},${bl},${(alpha * 0.95).toFixed(3)})`)
          grad.addColorStop(0.5, `rgba(${r},${g},${bl},${(alpha * 0.55).toFixed(3)})`)
          grad.addColorStop(1,   `rgba(${r},${g},${bl},${(alpha * 0.08).toFixed(3)})`)
          ctx.fillStyle = grad
          ctx.fillRect(x, H - barH, barW, barH)

          // Glowing peak cap
          if (lvl > 0.28) {
            const peakA = (lvl - 0.28) * 0.60
            ctx.save()
            ctx.shadowColor = `rgba(${r},${g},${bl},${peakA})`
            ctx.shadowBlur  = 18
            ctx.fillStyle   = `rgba(${r},${g},${bl},${(peakA * 2.0).toFixed(3)})`
            ctx.fillRect(x, H - barH - 1, barW, 2.5)
            ctx.restore()
          }

          // Floor reflection
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const featuredDate = featuredEvent?.event_date
    ? (() => { const d = new Date(featuredEvent.event_date); return isValid(d) ? d : null })()
    : null

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col overflow-x-hidden grain pt-[92px]"
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
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(255,69,0,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Radial glow overlay ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 55% at 50% 55%, rgba(255,69,0,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 max-w-screen-xl mx-auto w-full px-9 pb-[180px] flex flex-col items-center justify-center text-center">

        <div className="section-label mb-10 flex items-center gap-3">
          <span className="accent-line" />
          {t.hero.location}
          <span className="accent-line" />
        </div>

        <h1 className="font-black leading-none tracking-tight mb-10"
          style={{ fontSize: 'clamp(3.5rem, 16vw, 11rem)', color: 'var(--text)', letterSpacing: '-0.03em' }}>
          KENNY<br />
          <span style={{ color: 'var(--accent)' }} className="text-glow">BLACK</span>
        </h1>

        <p className="font-bold mb-6 tracking-wider"
          style={{ fontSize: 'clamp(0.75rem, 2.5vw, 1rem)', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          {t.hero.tagline}
        </p>

        <p className="max-w-lg mb-14 leading-relaxed" style={{ color: 'var(--muted)', fontSize: '1rem' }}>
          {t.hero.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
          <a href="/#book" onClick={(e) => { e.preventDefault(); window.location.hash = '#book' }}
            className="px-14 py-8 font-black tracking-widest uppercase transition-all duration-200 glow-accent flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.8rem' }}>
            {t.hero.bookCta}
          </a>
          <a href="/#about" onClick={(e) => { e.preventDefault(); window.location.hash = '#about' }}
            className="px-14 py-8 font-black tracking-widest uppercase border-2 transition-all duration-200 flex items-center justify-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text)', background: 'transparent', fontSize: '0.8rem' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
            {t.hero.learnMore}
          </a>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 w-full max-w-sm border-t pt-10" style={{ borderColor: 'var(--border)' }}>
          {[
            { value: '40+', label: t.hero.stats.years },
            { value: '1982', label: t.hero.stats.since },
            { value: 'Vinyl', label: t.hero.stats.vinyl },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="font-black text-2xl" style={{ color: 'var(--accent)' }}>{stat.value}</span>
              <span className="tracking-widest uppercase mt-1" style={{ color: 'var(--muted)', fontSize: '0.65rem' }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Featured event */}
        {featuredEvent && (
          <a href="/#events" onClick={(e) => { e.preventDefault(); window.location.hash = '#events' }}
            className="mt-10 flex items-center gap-4 px-5 py-3 border-l-2 text-left w-full max-w-sm transition-all duration-200"
            style={{ borderColor: 'var(--accent)', background: 'var(--surface)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}>
            {featuredDate && (
              <div className="flex-shrink-0 text-center" style={{ minWidth: '2.5rem' }}>
                <div className="font-black text-xl leading-none" style={{ color: 'var(--accent)' }}>{format(featuredDate, 'dd')}</div>
                <div className="font-bold tracking-widest uppercase" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>{format(featuredDate, 'MMM')}</div>
              </div>
            )}
            <div className="min-w-0">
              <p className="font-black uppercase tracking-wider truncate" style={{ color: 'var(--text)', fontSize: '0.75rem' }}>{featuredEvent.title}</p>
              <p className="truncate" style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>{featuredEvent.venue} · {featuredEvent.city}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="flex-shrink-0 ml-auto" style={{ color: 'var(--accent)' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>

      {/* ── Background mode switcher (2 buttons) ── */}
      <div className="absolute bottom-44 right-9 z-20 flex flex-col gap-1.5">

        {/* Spectrum button */}
        <button
          onClick={() => setBgMode('spectrum')}
          title="Spectrum"
          className="flex items-center justify-center transition-all duration-200"
          style={{
            width: '34px', height: '34px',
            background: bgMode === 'spectrum' ? 'var(--accent)' : 'color-mix(in srgb, var(--bg) 75%, transparent)',
            border: `1px solid ${bgMode === 'spectrum' ? 'var(--accent)' : 'var(--border)'}`,
            color: bgMode === 'spectrum' ? '#fff' : 'var(--muted)',
            backdropFilter: 'blur(8px)',
            boxShadow: bgMode === 'spectrum' ? '0 0 12px var(--accent-glow)' : 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="20" x2="4" y2="10"/>
            <line x1="8" y1="20" x2="8" y2="4"/>
            <line x1="12" y1="20" x2="12" y2="14"/>
            <line x1="16" y1="20" x2="16" y2="6"/>
            <line x1="20" y1="20" x2="20" y2="12"/>
          </svg>
        </button>

        {/* Photos button */}
        <button
          onClick={() => setBgMode('images')}
          title="Slideshow"
          className="flex items-center justify-center transition-all duration-200"
          style={{
            width: '34px', height: '34px',
            background: bgMode === 'images' ? 'var(--accent)' : 'color-mix(in srgb, var(--bg) 75%, transparent)',
            border: `1px solid ${bgMode === 'images' ? 'var(--accent)' : 'var(--border)'}`,
            color: bgMode === 'images' ? '#fff' : 'var(--muted)',
            backdropFilter: 'blur(8px)',
            boxShadow: bgMode === 'images' ? '0 0 12px var(--accent-glow)' : 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </button>
      </div>

      {/* ── Microphone permission prompt (spectrum mode only) ── */}
      {bgMode === 'spectrum' && micState === 'idle' && (
        <div className="absolute bottom-44 left-9 z-20">
          <button
            onClick={activateMic}
            className="flex items-center gap-2 px-3 py-2 font-bold tracking-widest uppercase transition-all duration-200"
            style={{
              fontSize: '0.6rem',
              background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
            }}
          >
            {/* Mic icon */}
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M5 10a7 7 0 0 0 14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="8" y1="22" x2="16" y2="22"/>
            </svg>
            Activate Live Spectrum
          </button>
        </div>
      )}

      {/* Requesting mic */}
      {bgMode === 'spectrum' && micState === 'requesting' && (
        <div className="absolute bottom-44 left-9 z-20 flex items-center gap-2 px-3 py-2"
          style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
            border: '1px solid var(--border)', color: 'var(--muted)', backdropFilter: 'blur(8px)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          Allow microphone…
        </div>
      )}

      {/* Mic active — LIVE indicator */}
      {bgMode === 'spectrum' && micState === 'active' && (
        <div className="absolute bottom-44 left-9 z-20 flex items-center gap-2 px-3 py-2"
          style={{
            fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
            background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
            border: '1px solid var(--accent)', color: 'var(--accent)', backdropFilter: 'blur(8px)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          Live
        </div>
      )}

      {/* Mic denied */}
      {bgMode === 'spectrum' && micState === 'denied' && (
        <div className="absolute bottom-44 left-9 z-20 flex items-center gap-2 px-3 py-2"
          style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
            border: '1px solid var(--border)', color: 'var(--muted-2)', backdropFilter: 'blur(8px)',
          }}>
          Mic blocked — simulated
        </div>
      )}

      {/* Slideshow dots */}
      {bgMode === 'images' && heroImages.length > 1 && (
        <div className="absolute bottom-44 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)}
              className="transition-all duration-300"
              style={{
                width: i === slideIdx ? '20px' : '6px', height: '6px',
                background: i === slideIdx ? 'var(--accent)' : 'var(--muted-2)',
                border: 'none', padding: 0,
              }} />
          ))}
        </div>
      )}
    </section>
  )
}
