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
  height = 48,
  accentColor = '#ff4500',
}: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const barsRef = useRef<number[]>(Array.from({ length: barCount }, () => Math.random() * 0.25 + 0.05))
  const velocitiesRef = useRef<number[]>(Array.from({ length: barCount }, () => 0))
  const isPlayingRef = useRef(isPlaying)
  const sizeRef = useRef({ W: 0 })

  // Keep ref in sync with prop so animate loop doesn't need to re-run
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
      if (W === 0) {
        resize()
        animRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, W, height)
      tick += 0.04

      const slot = W / barCount
      const barW = slot * 0.55
      const gap = slot * 0.45

      for (let i = 0; i < barCount; i++) {
        const x = i * (barW + gap)
        const playing = isPlayingRef.current

        if (playing) {
          const target =
            0.12 +
            Math.abs(
              Math.sin(tick * (0.7 + i * 0.11)) *
              Math.cos(tick * (0.3 + i * 0.07)) *
              Math.sin(tick * 1.3 + i * 0.23)
            ) * 0.88

          const diff = target - barsRef.current[i]
          velocitiesRef.current[i] += diff * 0.35
          velocitiesRef.current[i] *= 0.72
          barsRef.current[i] = Math.max(0.03, Math.min(1, barsRef.current[i] + velocitiesRef.current[i]))
        } else {
          barsRef.current[i] *= 0.91
          if (barsRef.current[i] < 0.03) barsRef.current[i] = 0.03
        }

        const barH = barsRef.current[i] * height
        const alpha = 0.3 + barsRef.current[i] * 0.7

        const gradient = ctx.createLinearGradient(0, height - barH, 0, height)
        gradient.addColorStop(0, accentColor)
        gradient.addColorStop(0.45, `${accentColor}99`)
        gradient.addColorStop(1, `${accentColor}18`)

        ctx.globalAlpha = alpha
        ctx.fillStyle = gradient
        ctx.fillRect(x, height - barH, barW, barH)
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(animate)
    }

    // Initial size + start loop
    resize()
    animRef.current = requestAnimationFrame(animate)

    const ro = new ResizeObserver(() => resize())
    const target = canvas.parentElement || canvas
    ro.observe(target)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [barCount, height, accentColor])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
    />
  )
}
