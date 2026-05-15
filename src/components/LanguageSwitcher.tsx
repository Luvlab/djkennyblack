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

  const btnStyle = {
    height: '40px',
    background: open ? 'var(--surface-3)' : 'var(--surface-2)',
    border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
    color: open ? 'var(--accent)' : 'var(--muted)',
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 font-bold tracking-wider transition-all duration-200"
        style={{ ...btnStyle, fontSize: '0.7rem', minWidth: '60px' }}
        onMouseEnter={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
            ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
          }
        }}
      >
        <span style={{ fontSize: '1rem' }}>{current.flag}</span>
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <svg width="7" height="7" viewBox="0 0 8 8" fill="currentColor"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M0 2l4 4 4-4H0z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 right-0 overflow-hidden z-50"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            minWidth: '150px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}
        >
          {LOCALES.map((loc) => (
            <button
              key={loc.code}
              onClick={() => { setLocale(loc.code); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 font-bold tracking-wider transition-all duration-150"
              style={{
                background: locale === loc.code ? 'var(--surface-2)' : 'transparent',
                color: locale === loc.code ? 'var(--accent)' : 'var(--muted)',
                textAlign: 'left',
                fontSize: '0.7rem',
              }}
              onMouseEnter={(e) => {
                if (locale !== loc.code) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (locale !== loc.code) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '1rem' }}>{loc.flag}</span>
              <span>{loc.label}</span>
              {locale === loc.code && <span className="ml-auto" style={{ color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
