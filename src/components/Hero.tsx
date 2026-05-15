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

const DEFAULT_IMAGES = [
  'https://dj50spann.se/wp-content/uploads/067/dj50s_ep067_hero_210.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzFaeeGu8tnsjOSiqHuDf_OPzPWfrOcz37xw&s',
]

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

const TOTAL_BARS = 80

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const { t } = useLang()

  const [bgMode, setBgMode] = useState<HeroBg>('spectrum')
  const bgModeRef = useRef<HeroBg>('spectrum')

  // ── Real microphone / Web Audio API ──────────────────────────────────────
  const [micState, setMicState] = useState<MicState>('idle')
  const micStateRef = useRef<MicState>('idle')
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)

  // ── Sensitivity ──────────────────────────────────────────────────────────
  const [sensitivity, setSensitivity] = useState(2.5)
  const sensitivityRef = useRef(2.5)

  const activateMic = async () => {
    if (micStateRef.current === 'requesting' || micStateRef.current === 'active') return
    setMicState('requesting')
    micStateRef.current = 'requesting'
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 8192
      analyser.smoothingTimeConstant = 0.65
      analyser.minDecibels = -100
      analyser.maxDecibels = -20
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

  useEffect(() => {
    activateMic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach((tr) => tr.stop())
      audioCtxRef.current?.close()
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const displayRef = useRef<number[]>(Array.from({ length: TOTAL_BARS }, () => 0))

  const [genres, setGenres]               = useState<string[]>(DEFAULT_GENRES)
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)
  const [heroImages, setHeroImages]       = useState<string[]>(DEFAULT_IMAGES)
  const [slideIdx, setSlideIdx]           = useState(0)

  useEffect(() => { bgModeRef.current = bgMode }, [bgMode])
  useEffect(() => { micStateRef.current = micState }, [micState])
  useEffect(() => { sensitivityRef.current = sensitivity }, [sensitivity])

  useEffect(() => {
    supabase.from('site_settings').select('key, value').in('key', ['hero_genres', 'hero_images'])
      .then(({ data }) => {
        data?.forEach((d) => {
          if (d.key === 'hero_genres' && d.value) {
            const list = d.value.split(',').map((g: string) => g.trim()).filter(Boolean)
            if (list.length > 0) setGenres(list)
          }
          if (d.key === 'hero_images' && d.value) {
            const dbImgs = d.value.split(',').map((u: string) => u.trim()).filter(Boolean)
            if (dbImgs.length > 0) setHeroImages(dbImgs)
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
      })
  }, [])

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

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height

      if (bgModeRef.current !== 'spectrum' || micStateRef.current !== 'active' || !analyserRef.current || !freqDataRef.current) {
        ctx.clearRect(0, 0, W, H)
        animRef.current = requestAnimationFrame(draw)
        return
      }

      ctx.clearRect(0, 0, W, H)

      const sampleRate = audioCtxRef.current?.sampleRate ?? 44100
      const nyquist    = sampleRate / 2
      analyserRef.current.getByteFrequencyData(freqDataRef.current)

      const n    = TOTAL_BARS
      const slot = W / n
      const barW = Math.max(1, slot * 0.62)
      const gap  = slot - barW

      for (let i = 0; i < n; i++) {
        const tPos = i / (n - 1)
        const freq  = 20 * Math.pow(1000, tPos)
        const numBins = freqDataRef.current.length
        const bin   = Math.min(Math.round((freq / nyquist) * numBins), numBins - 1)
        const raw   = Math.min(1, (freqDataRef.current[bin] / 255) * sensitivityRef.current)

        const diff = raw - displayRef.current[i]
        displayRef.current[i] += diff > 0 ? diff * 0.60 : diff * 0.15
        displayRef.current[i] = Math.max(0, Math.min(1, displayRef.current[i]))

        const lvl = displayRef.current[i]
        if (lvl < 0.005) continue

        const x    = i * slot + gap * 0.5
        const barH = lvl * H * 0.75
        const [r, g, bl] = specRGB(tPos)

        const alpha = 0.15 + lvl * 0.38
        const grad  = ctx.createLinearGradient(0, H - barH, 0, H)
        grad.addColorStop(0,   `rgba(${r},${g},${bl},${(alpha * 0.95).toFixed(3)})`)
        grad.addColorStop(0.5, `rgba(${r},${g},${bl},${(alpha * 0.55).toFixed(3)})`)
        grad.addColorStop(1,   `rgba(${r},${g},${bl},${(alpha * 0.08).toFixed(3)})`)
        ctx.fillStyle = grad
        ctx.fillRect(x, H - barH, barW, barH)

        if (lvl > 0.28) {
          const peakA = (lvl - 0.28) * 0.60
          ctx.save()
          ctx.shadowColor = `rgba(${r},${g},${bl},${peakA})`
          ctx.shadowBlur  = 18
          ctx.fillStyle   = `rgba(${r},${g},${bl},${(peakA * 2.0).toFixed(3)})`
          ctx.fillRect(x, H - barH - 1, barW, 2.5)
          ctx.restore()
        }

        const refGrad = ctx.createLinearGradient(0, H, 0, H + barH * 0.28)
        refGrad.addColorStop(0, `rgba(${r},${g},${bl},${(alpha * 0.22).toFixed(3)})`)
        refGrad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx.fillStyle = refGrad
        ctx.fillRect(x, H, barW, barH * 0.28)
      }

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
      className="relative overflow-hidden grain"
      style={{ height: '100dvh', background: 'var(--bg)' }}
    >
      {/* ── Spectrum canvas — fills full section ── */}
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

      {/* ── Radial glow overlay ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(255,69,0,0.06) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Main content — pinned exactly between header (92px) and player (130px) ── */}
      <div
        className="absolute inset-x-0 z-10 overflow-hidden"
        style={{ top: '92px', bottom: '130px' }}
      >
        <div className="h-full max-w-screen-xl mx-auto px-5 lg:px-8 flex flex-col items-start justify-center">

          <p className="section-label mb-3 sm:mb-6">{t.hero.location}</p>

          <h1
            className="font-black leading-none tracking-tight mb-3 sm:mb-6 whitespace-nowrap"
            style={{ fontSize: 'clamp(2.2rem, 10vw, 8rem)', letterSpacing: '-0.03em', color: 'var(--text)' }}
          >
            KENNY{' '}
            <span style={{
              color: 'transparent',
              WebkitTextStroke: '2px var(--accent)',
              filter: 'drop-shadow(0 0 24px rgba(255,69,0,0.6))',
            }}>
              BLACK
            </span>
          </h1>

          <p className="font-bold mb-3 sm:mb-5 tracking-wider"
            style={{ fontSize: 'clamp(0.7rem, 2vw, 0.9rem)', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {t.hero.tagline}
          </p>

          <p className="max-w-lg mb-5 sm:mb-10 leading-relaxed hidden sm:block" style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            {t.hero.description}
          </p>
          <p className="max-w-xs mb-4 leading-snug sm:hidden" style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>
            {t.hero.description}
          </p>

          {/* CTAs — always side by side */}
          <div className="flex flex-row gap-3 w-full sm:w-auto">
            <a href="#book" onClick={(e) => { e.preventDefault(); window.location.hash = '#book' }}
              className="flex-1 sm:flex-initial px-7 sm:px-12 py-3 sm:py-5 font-black tracking-widest uppercase transition-all duration-200 glow-accent flex items-center justify-center rounded-full"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', whiteSpace: 'nowrap' }}>
              {t.hero.bookCta}
            </a>
            <a href="#about" onClick={(e) => { e.preventDefault(); window.location.hash = '#about' }}
              className="flex-1 sm:flex-initial px-7 sm:px-12 py-3 sm:py-5 font-black tracking-widest uppercase border-2 transition-all duration-200 flex items-center justify-center rounded-full"
              style={{ borderColor: 'var(--accent)', color: 'var(--text)', background: 'transparent', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'var(--accent)'
                ;(e.currentTarget as HTMLElement).style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--text)'
              }}>
              {t.hero.learnMore}
            </a>
          </div>

          {/* Stats */}
          <div className="mt-5 sm:mt-10 grid grid-cols-3 gap-6 sm:gap-10 border-t pt-4 sm:pt-8" style={{ borderColor: 'var(--border)', minWidth: '240px' }}>
            {[
              { value: '40+', label: t.hero.stats.years },
              { value: '1982', label: t.hero.stats.since },
              { value: 'Vinyl', label: t.hero.stats.vinyl },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-start">
                <span className="font-black text-xl sm:text-2xl" style={{ color: 'var(--accent)' }}>{stat.value}</span>
                <span className="tracking-widest uppercase mt-1" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Featured event — hidden on small mobile to save space */}
          {featuredEvent && (
            <a href="#events" onClick={(e) => { e.preventDefault(); window.location.hash = '#events' }}
              className="mt-4 sm:mt-8 hidden sm:flex items-center gap-4 px-5 py-3 border-l-2 text-left w-full max-w-md transition-all duration-200"
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
      </div>

      {/* ── Background mode switcher — sits just above player ── */}
      <div className="absolute z-20 flex flex-col gap-1.5" style={{ bottom: '138px', right: '1.25rem' }}>
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

      {/* ── Mic status + sensitivity slider ── */}
      {bgMode === 'spectrum' && (
        <div className="absolute z-20 flex flex-col gap-2" style={{ bottom: '138px', left: '1.25rem' }}>
          {micState === 'requesting' && (
            <div className="flex items-center gap-2 px-3 py-2"
              style={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                border: '1px solid var(--border)', color: 'var(--muted)', backdropFilter: 'blur(8px)',
              }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              Allow microphone…
            </div>
          )}
          {micState === 'active' && (
            <>
              <div className="flex items-center gap-2 px-3 py-2"
                style={{
                  fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
                  background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                  border: '1px solid var(--accent)', color: 'var(--accent)', backdropFilter: 'blur(8px)',
                }}>
                <span className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                Live
              </div>
              {/* Sensitivity slider */}
              <div className="px-3 py-2"
                style={{
                  background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                  border: '1px solid var(--border)', backdropFilter: 'blur(8px)',
                  minWidth: '130px',
                }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    Sensitivity
                  </span>
                  <span style={{ fontSize: '0.52rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.05em' }}>
                    {sensitivity.toFixed(1)}×
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={8}
                  step={0.1}
                  value={sensitivity}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    setSensitivity(v)
                    sensitivityRef.current = v
                  }}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '3px' }}
                />
              </div>
            </>
          )}
          {micState === 'denied' && (
            <button onClick={activateMic}
              className="flex items-center gap-2 px-3 py-2 transition-all duration-200"
              style={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                background: 'color-mix(in srgb, var(--bg) 80%, transparent)',
                border: '1px solid var(--border)', color: 'var(--muted-2)', backdropFilter: 'blur(8px)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--muted-2)'
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
                <line x1="8" y1="22" x2="16" y2="22"/>
              </svg>
              Retry mic
            </button>
          )}
        </div>
      )}

      {/* Slideshow dots */}
      {bgMode === 'images' && heroImages.length > 1 && (
        <div className="absolute z-20 flex gap-1.5" style={{ bottom: '138px', left: '1.25rem' }}>
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
