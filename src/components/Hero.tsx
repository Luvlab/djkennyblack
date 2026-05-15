'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/context/LangContext'

const genres = [
  'Deep House', 'Soul', 'Funk', 'Old School Hip Hop', 'Vinyl Only',
  'Electro', 'Boogie', 'Jazz-Funk', 'Tech House', 'Garage House',
  'G-Funk', 'Soulful House', 'Classic House', 'R&B', 'Afrobeat',
]

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { t } = useLang()

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
        const height = Math.abs(freq) * 120 + 4
        const alpha = 0.12 + Math.abs(freq) * 0.25

        ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`
        ctx.fillRect(x, centerY - height, barWidth - 1, height * 2)
      }

      animId = requestAnimationFrame(drawWaveform)
    }
    drawWaveform()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden grain"
      style={{ background: 'var(--bg)' }}
    >
      {/* Animated waveform background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(255,69,0,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-5 sm:px-8 pt-28 pb-16 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="section-label mb-6 flex items-center gap-3">
          <span className="accent-line" />
          {t.hero.location}
          <span className="accent-line" />
        </div>

        {/* Main title */}
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

        {/* Tagline */}
        <p
          className="font-medium mb-2 tracking-wider"
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
          style={{ color: 'var(--muted)', fontSize: '0.95rem' }}
        >
          {t.hero.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
          <a
            href="/#book"
            className="px-10 py-8 font-bold text-sm tracking-widest uppercase rounded transition-all duration-200 glow-accent flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {t.hero.bookCta}
          </a>
          <a
            href="/#about"
            className="px-10 py-8 font-bold text-sm tracking-widest uppercase rounded border transition-all duration-200 flex items-center justify-center"
            style={{
              border: '2px solid var(--border)',
              color: 'var(--text)',
              background: 'transparent',
            }}
          >
            {t.hero.learnMore}
          </a>
        </div>

        {/* Stats row */}
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
              <span
                className="font-black text-2xl"
                style={{ color: 'var(--accent)' }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs tracking-widest uppercase mt-1"
                style={{ color: 'var(--muted)' }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling genre ticker */}
      <div
        className="relative z-10 overflow-hidden border-t border-b py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="ticker-track flex gap-8 whitespace-nowrap w-max">
          {[...genres, ...genres].map((g, i) => (
            <span
              key={i}
              className="text-xs font-bold tracking-widest uppercase flex items-center gap-8"
              style={{ color: 'var(--muted-2)' }}
            >
              {g}
              <span style={{ color: 'var(--accent)', fontSize: '0.5rem' }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
