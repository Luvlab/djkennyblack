'use client'

import { useEffect, useRef, useState } from 'react'
import VUMeter from './VUMeter'

const mixes = [
  { slug: '/soulcorner-kennyblack/sss-366-kenny-black/', title: 'SSS #36.6 Kenny Black', genres: 'Deep House · Tech House' },
  { slug: '/soulcorner-kennyblack/funk-soul-mix-body-soul/', title: 'Funk-Soul Mix (Body & Soul)', genres: 'Soul · Funk · Vinyl Only' },
  { slug: '/soulcorner-kennyblack/deep-adventure-somewhere-in-stockholm/', title: 'Deep Adventure – Stockholm', genres: 'Classic House · Deep Tech' },
  { slug: '/soulcorner-kennyblack/sss-365-kenny-black/', title: 'SSS #36.5 Kenny Black', genres: 'Old School Hip Hop · Electro' },
  { slug: '/soulcorner-kennyblack/after-work-vibes-elite-hotel-marina-tower-2023/', title: 'After Work Vibes @ Elite Hotel', genres: 'Soul · Funk · Boogie' },
  { slug: '/soulcorner-kennyblack/faces-of-house-classic-mix/', title: '"Faces of House" (Classic Mix)', genres: 'Deep House · Garage House' },
  { slug: '/soulcorner-kennyblack/bumping-deep-house-grooves/', title: 'Bumping Deep House Grooves', genres: 'Deep House · Classic House' },
  { slug: '/soulcorner-kennyblack/skywalker-og-house-music-in-deep-space/', title: 'Skywalker OG. House in Deep Space', genres: 'Deep House · Afro · Soulful' },
  { slug: '/soulcorner-kennyblack/soul-corner-street-jazz-mix-1/', title: 'Soul Corner Street Jazz Mix 1', genres: 'Jazz-Funk · Chillout' },
]

export default function MixcloudPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<MixcloudWidget | null>(null)

  const currentMix = mixes[currentIndex]
  const embedUrl = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=${encodeURIComponent(currentMix.slug)}&autoplay=0&dark=1`

  useEffect(() => {
    // Load Mixcloud widget API
    if (typeof window === 'undefined') return

    const loadScript = () => {
      if ((window as Window & { Mixcloud?: MixcloudAPI }).Mixcloud) {
        initWidget()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://widget.mixcloud.com/media/js/widgetApi.js'
      script.async = true
      script.onload = initWidget
      document.head.appendChild(script)
    }

    const initWidget = () => {
      const iframe = iframeRef.current
      if (!iframe) return
      const MC = (window as Window & { Mixcloud?: MixcloudAPI }).Mixcloud
      if (!MC) return

      const widget = MC.PlayerWidget(iframe)
      widgetRef.current = widget

      widget.ready.then(() => {
        setLoaded(true)
        widget.events.play.on(() => setIsPlaying(true))
        widget.events.pause.on(() => setIsPlaying(false))
        widget.events.ended.on(() => setIsPlaying(false))
      })
    }

    loadScript()
  }, [currentIndex])

  const handleMixSelect = (index: number) => {
    setCurrentIndex(index)
    setIsPlaying(false)
    setLoaded(false)
  }

  return (
    <div
      className="w-full"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* VU Meter strip */}
      <div className="px-4 pt-3 pb-1">
        <VUMeter isPlaying={isPlaying} barCount={40} height={36} accentColor="#ff4500" />
      </div>

      {/* Mix selector */}
      <div
        className="px-4 py-2 overflow-x-auto flex gap-2 no-scrollbar"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {mixes.map((mix, i) => (
          <button
            key={i}
            onClick={() => handleMixSelect(i)}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-bold tracking-wider rounded transition-all duration-200 whitespace-nowrap"
            style={{
              background: currentIndex === i ? 'var(--accent)' : 'var(--surface-2)',
              color: currentIndex === i ? '#fff' : 'var(--muted)',
              border: `1px solid ${currentIndex === i ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {mix.title}
          </button>
        ))}
      </div>

      {/* Now playing info + iframe */}
      <div className="px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Track info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: isPlaying ? 'var(--accent)' : 'var(--muted-2)',
                boxShadow: isPlaying ? '0 0 8px var(--accent)' : 'none',
                animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none',
              }}
            />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: isPlaying ? 'var(--accent)' : 'var(--muted)' }}
            >
              {isPlaying ? 'Now Playing' : 'Select a Mix'}
            </span>
          </div>
          <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
            {currentMix.title}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {currentMix.genres}
          </p>
        </div>

        {/* Mixcloud link */}
        <a
          href="https://www.mixcloud.com/soulcorner-kennyblack/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-xs font-bold tracking-wider rounded border transition-all duration-200"
          style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.25 0a4.75 4.75 0 1 0-9.5 0 4.75 4.75 0 0 0 9.5 0z"/>
          </svg>
          Mixcloud
        </a>
      </div>

      {/* Iframe player */}
      <div className="px-4 pb-4">
        <iframe
          ref={iframeRef}
          key={currentIndex}
          src={embedUrl}
          width="100%"
          height="60"
          frameBorder="0"
          allow="autoplay"
          style={{
            display: 'block',
            borderRadius: '2px',
            border: '1px solid var(--border)',
          }}
          title={`Kenny Black – ${currentMix.title}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}

// Type declarations for Mixcloud Widget API
interface MixcloudWidget {
  ready: Promise<void>
  events: {
    play: { on: (cb: () => void) => void }
    pause: { on: (cb: () => void) => void }
    ended: { on: (cb: () => void) => void }
    buffering: { on: (cb: () => void) => void }
  }
  play: () => void
  pause: () => void
}

interface MixcloudAPI {
  PlayerWidget: (iframe: HTMLIFrameElement) => MixcloudWidget
}
