'use client'

import { useEffect, useRef } from 'react'

interface VUMeterProps {
  isPlaying: boolean
  barCount?: number
  height?: number
  accentColor?: string
}

// Frequency band definitions — left = bass, right = treble
// Each band: [barCount, maxAmplitude, noiseSpeedX, noiseSpeedY, smoothing]
const BANDS = [
  { count: 3, amp: 0.93, nx: 0.07, ny: 0.55, smooth: 0.90 }, // sub-bass: massive, glacial
  { count: 5, amp: 0.80, nx: 0.13, ny: 0.80, smooth: 0.86 }, // bass: large, slow
  { count: 6, amp: 0.63, nx: 0.21, ny: 1.10, smooth: 0.80 }, // low-mid
  { count: 8, amp: 0.46, nx: 0.33, ny: 1.60, smooth: 0.73 }, // mid
  { count: 7, amp: 0.29, nx: 0.50, ny: 2.20, smooth: 0.65 }, // high-mid
  { count: 6, amp: 0.17, nx: 0.72, ny: 3.10, smooth: 0.57 }, // presence
  { count: 5, amp: 0.10, nx: 1.10, ny: 4.50, smooth: 0.48 }, // brilliance: tiny, jittery
]
// Total bars: 40

// Bar colour by position (0=bass, 1=treble)
function barColor(t: number, alpha: number): string {
  // Bass: accent orange-red → mid: yellow → treble: cyan-white
  if (t < 0.35) {
    return `rgba(255,69,0,${alpha})`
  } else if (t < 0.65) {
    const r = Math.round(255 - (t - 0.35) / 0.30 * 30)
    const g = Math.round(100 + (t - 0.35) / 0.30 * 100)
    return `rgba(${r},${g},0,${alpha})`
  } else {
    const g = Math.round(200 - (t - 0.65) / 0.35 * 80)
    const b = Math.round((t - 0.65) / 0.35 * 200)
    return `rgba(200,${g},${b},${alpha})`
  }
}

export default function VUMeter({
  isPlaying,
  barCount = 40,
  height = 48,
  accentColor = '#ff4500',
}: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const sizeRef = useRef({ W: 0 })
  const isPlayingRef = useRef(isPlaying)

  // Total bars from bands (may differ from barCount prop — use barCount to scale)
  const totalBandBars = BANDS.reduce((s, b) => s + b.count, 0)

  // Per-bar state
  const levelsRef = useRef<number[]>(Array.from({ length: totalBandBars }, () => 0.03))
  const peaksRef = useRef<number[]>(Array.from({ length: totalBandBars }, () => 0.03))
  const peakTimersRef = useRef<number[]>(Array.from({ length: totalBandBars }, () => 0))
  // Independent noise phases per bar
  const phasesRef = useRef<number[]>(Array.from({ length: totalBandBars }, (_, i) => i * 1.618))

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let tick = 0

    const resize = () => {
      const parent = canvas.parentElement
      const W = (parent ? parent.getBoundingClientRect().width : canvas.getBoundingClientRect().width) || 0
      if (W === sizeRef.current.W || W === 0) return
      sizeRef.current.W = W
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const animate = () => {
      const W = sizeRef.current.W
      if (W === 0) { resize(); animRef.current = requestAnimationFrame(animate); return }

      ctx.clearRect(0, 0, W, height)
      tick += 0.035

      const n = totalBandBars
      const slot = W / n
      const barW = Math.max(1, slot * 0.60)
      const gap = slot - barW

      let barIdx = 0
      let bandStart = 0

      BANDS.forEach((band) => {
        for (let b = 0; b < band.count; b++) {
          const i = bandStart + b
          const t = i / (n - 1) // 0=bass, 1=treble

          if (isPlayingRef.current) {
            // Perlin-like noise: two orthogonal sine products with per-bar phase offset
            const ph = phasesRef.current[i]
            const noise = (
              Math.sin(tick * band.ny + ph) *
              Math.cos(tick * band.ny * 0.71 + ph * 1.37) *
              Math.sin(tick * band.ny * 0.43 + b * band.nx + ph * 0.8)
            )
            const target = band.amp * (0.15 + 0.85 * Math.abs(noise))

            // Asymmetric attack/release (fast attack, slower release)
            const diff = target - levelsRef.current[i]
            if (diff > 0) {
              levelsRef.current[i] += diff * (1 - band.smooth) * 2.5
            } else {
              levelsRef.current[i] += diff * (1 - band.smooth)
            }
            levelsRef.current[i] = Math.max(0.03, Math.min(1, levelsRef.current[i]))

            // Peak hold
            if (levelsRef.current[i] >= peaksRef.current[i]) {
              peaksRef.current[i] = levelsRef.current[i]
              peakTimersRef.current[i] = 28 // hold frames
            } else {
              peakTimersRef.current[i]--
              if (peakTimersRef.current[i] <= 0) {
                peaksRef.current[i] *= 0.96 // slow fall
              }
            }
            peaksRef.current[i] = Math.max(levelsRef.current[i], 0.03)
          } else {
            levelsRef.current[i] *= 0.88
            peaksRef.current[i] *= 0.92
            if (levelsRef.current[i] < 0.03) levelsRef.current[i] = 0.03
            if (peaksRef.current[i] < 0.03) peaksRef.current[i] = 0.03
          }

          const x = i * slot + gap * 0.5
          const barH = levelsRef.current[i] * height
          const alpha = 0.35 + levelsRef.current[i] * 0.65

          // Vertical gradient per bar
          const grad = ctx.createLinearGradient(0, height - barH, 0, height)
          const topCol = barColor(t, alpha)
          const botCol = barColor(t, alpha * 0.25)
          grad.addColorStop(0, topCol)
          grad.addColorStop(0.5, barColor(t, alpha * 0.7))
          grad.addColorStop(1, botCol)

          ctx.fillStyle = grad
          ctx.fillRect(x, height - barH, barW, barH)

          // Peak hold dot
          const peakY = height - peaksRef.current[i] * height - 1
          if (peaksRef.current[i] > 0.06) {
            ctx.globalAlpha = 0.7
            ctx.fillStyle = barColor(t, 1)
            ctx.fillRect(x, peakY, barW, 1.5)
            ctx.globalAlpha = 1
          }
        }
        bandStart += band.count
      })

      animRef.current = requestAnimationFrame(animate)
    }

    resize()
    animRef.current = requestAnimationFrame(animate)

    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas.parentElement || canvas)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [height, totalBandBars])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    />
  )
}
