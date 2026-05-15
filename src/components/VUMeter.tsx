'use client'

import { useEffect, useRef } from 'react'

interface VUMeterProps {
  isPlaying: boolean
  barCount?: number
  height?: number
  accentColor?: string
}

export default function VUMeter({
  isPlaying,
  barCount = 32,
  height = 40,
  accentColor = '#ff4500',
}: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const barsRef = useRef<number[]>(Array.from({ length: barCount }, () => Math.random()))
  const velocitiesRef = useRef<number[]>(Array.from({ length: barCount }, () => 0))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = height
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)

    const barW = (W / barCount) * 0.6
    const gap = (W / barCount) * 0.4

    let tick = 0

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      tick += 0.04

      for (let i = 0; i < barCount; i++) {
        const x = i * (barW + gap)

        if (isPlaying) {
          // Organic movement: each bar has a slightly different frequency
          const target =
            0.15 +
            Math.abs(
              Math.sin(tick * (0.7 + i * 0.11)) *
                Math.cos(tick * (0.3 + i * 0.07)) *
                Math.sin(tick * 1.3 + i * 0.23)
            ) *
              0.85

          // Spring physics
          const diff = target - barsRef.current[i]
          velocitiesRef.current[i] += diff * 0.35
          velocitiesRef.current[i] *= 0.72
          barsRef.current[i] = Math.max(
            0.02,
            Math.min(1, barsRef.current[i] + velocitiesRef.current[i])
          )
        } else {
          // Decay when paused
          barsRef.current[i] *= 0.92
          if (barsRef.current[i] < 0.02) barsRef.current[i] = 0.02
        }

        const barH = barsRef.current[i] * H
        const alpha = 0.4 + barsRef.current[i] * 0.6

        // Color: orange at top fading to dim at bottom
        const gradient = ctx.createLinearGradient(0, H - barH, 0, H)
        gradient.addColorStop(0, `${accentColor}`)
        gradient.addColorStop(0.5, `${accentColor}88`)
        gradient.addColorStop(1, `${accentColor}22`)

        ctx.globalAlpha = alpha
        ctx.fillStyle = gradient
        ctx.fillRect(x, H - barH, barW, barH)
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, barCount, height, accentColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    />
  )
}
