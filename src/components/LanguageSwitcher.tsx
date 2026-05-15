'use client'

import { useState, useRef, useEffect } from 'react'
import { useLang, LOCALES } from '@/context/LangContext'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-bold tracking-wider transition-all duration-200"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          color: 'var(--muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.color = 'var(--accent)'
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--muted)'
          }
        }}
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M0 2l4 4 4-4H0z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 right-0 rounded overflow-hidden z-50"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            minWidth: '140px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
        >
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => { setLocale(loc.code); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold tracking-wider transition-all duration-150"
              style={{
                background: locale === loc.code ? 'var(--surface-2)' : 'transparent',
                color: locale === loc.code ? 'var(--accent)' : 'var(--muted)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (locale !== loc.code) e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (locale !== loc.code) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span>{loc.flag}</span>
              <span>{loc.label}</span>
              {locale === loc.code && <span className="ml-auto" style={{ color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
