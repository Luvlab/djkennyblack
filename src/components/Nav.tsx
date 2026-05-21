'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useLang } from '@/context/LangContext'
import { useCart } from '@/context/CartContext'

/* ── Random display fonts ──────────────────────────────────────────────────── */
type DispFont = { family: string; w: string }

const FONTS: DispFont[] = [
  { family: 'Bebas Neue',       w: '400' },
  { family: 'Black Ops One',    w: '400' },
  { family: 'Orbitron',         w: '900' },
  { family: 'Syncopate',        w: '700' },
  { family: 'Russo One',        w: '400' },
  { family: 'Teko',             w: '700' },
  { family: 'Press Start 2P',   w: '400' },
  { family: 'Boogaloo',         w: '400' },
  { family: 'Alfa Slab One',    w: '400' },
  { family: 'Bangers',          w: '400' },
  { family: 'Permanent Marker', w: '400' },
  { family: 'Righteous',        w: '400' },
  { family: 'Chakra Petch',     w: '700' },
  { family: 'Rock Salt',        w: '400' },
  { family: 'Black Han Sans',   w: '400' },
  { family: 'Exo 2',            w: '900' },
]

const loadedFonts = new Set<string>()

function loadFont(f: DispFont) {
  if (typeof document === 'undefined' || loadedFonts.has(f.family)) return
  loadedFonts.add(f.family)
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = `https://fonts.googleapis.com/css2?family=${f.family.replace(/ /g, '+')}:wght@${f.w}&display=swap`
  document.head.appendChild(el)
}

function pickDifferent(current: DispFont | null, notSameAs: DispFont | null): DispFont {
  const pool = FONTS.filter(
    f => f.family !== current?.family && f.family !== notSameAs?.family
  )
  const picked = pool[Math.floor(Math.random() * pool.length)]
  loadFont(picked)
  return picked
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function Nav() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const [kbFont, setKbFont]       = useState<DispFont | null>(null)
  const [titleFont, setTitleFont] = useState<DispFont | null>(null)
  const { t } = useLang()
  const { count, openCart } = useCart()
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const sync = () => setActiveHash(window.location.hash)
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const close = () => setMenuOpen(false)

  const goHash = (hash: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    close()
    if (isHome) {
      e.preventDefault()
      window.location.hash = hash
    }
  }

  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`)

  // Click logo → randomise both fonts independently
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    close()
    setActiveHash('')
    if (isHome) window.location.hash = ''
    const newKb    = pickDifferent(kbFont, titleFont)
    const newTitle = pickDifferent(titleFont, newKb)
    setKbFont(newKb)
    setTitleFont(newTitle)
  }

  const links = [
    { hash: '#about',        label: t.nav.about },
    { hash: '#services',     label: t.nav.services },
    { hash: '#events',       label: t.nav.events },
    { hash: '#testimonials', label: t.nav.press },
    { hash: '#archive',      label: t.nav.archive },
    { hash: '#school',       label: t.nav.school },
    { hash: '#book',         label: t.nav.book },
    { hash: '#shop',         label: 'Shop' },
    { hash: '#contact',      label: 'Contact' },
  ]

  const isActive = (hash: string) =>
    isHome && (activeHash === hash || (hash === '#about' && activeHash === ''))

  const mixerBtn = (active: boolean) => ({
    background: active ? 'var(--accent)' : 'rgba(0,0,0,0.55)',
    border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.10)'}`,
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    color: active ? '#fff' : 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(10px)',
    boxShadow: active
      ? '0 0 16px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.12)'
      : 'inset 0 1px 0 rgba(255,255,255,0.06)',
    transition: 'all 0.12s ease',
  })

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'color-mix(in srgb, var(--bg) 94%, transparent)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        }}
      >
        {/* Full-width — no max-w, no horizontal padding */}
        <div className="h-12 flex items-stretch justify-between">

          {/* ── Logo ── */}
          <a
            href="/#"
            onClick={handleLogoClick}
            title="Click to change fonts"
            className="self-stretch flex items-center gap-3 flex-shrink-0 select-none"
            style={{ cursor: 'pointer' }}
          >
            {/* KB square — fills full nav height */}
            <div
              className="h-full aspect-square flex items-center justify-center text-base"
              style={{
                background: 'var(--accent)',
                color: '#fff',
                fontFamily: kbFont ? `'${kbFont.family}', sans-serif` : undefined,
                fontWeight: kbFont ? Number(kbFont.w) : 900,
                transition: 'font-family 0.2s',
              }}
            >
              KB
            </div>

            {/* App title */}
            <span
              className="uppercase hidden sm:block"
              style={{
                color: 'var(--text)',
                fontSize: '1rem',
                letterSpacing: '0.1em',
                fontFamily: titleFont ? `'${titleFont.family}', sans-serif` : undefined,
                fontWeight: titleFont ? Number(titleFont.w) : 900,
                transition: 'font-family 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Kenny Black
            </span>
          </a>

          {/* ── Desktop nav ── */}
          <div className="hidden lg:flex items-center gap-1.5 flex-1 justify-center">
            {links.map((l) => {
              const active = isActive(l.hash)
              return (
                <a
                  key={l.hash}
                  href={hrefFor(l.hash)}
                  onClick={goHash(l.hash)}
                  className="self-stretch flex flex-col items-center justify-center px-5 gap-1.5 tracking-widest uppercase font-black"
                  style={{ ...mixerBtn(active), minWidth: '80px', fontSize: '0.6rem', textDecoration: 'none' }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'rgba(255,255,255,0.10)'
                      el.style.color = 'rgba(255,255,255,0.78)'
                    }
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: active ? '#fff' : 'var(--surface-3)',
                      boxShadow: active ? '0 0 8px rgba(255,255,255,0.9)' : 'none',
                    }}
                  />
                  {l.label}
                </a>
              )
            })}
          </div>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2 flex-shrink-0 pr-2">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center transition-all duration-200"
              aria-label="Open cart"
              style={{
                width: '40px', height: '40px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-0.5 font-black"
                  style={{ background: 'var(--accent)', color: '#fff', fontSize: '10px' }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Book Now */}
            <a
              href={hrefFor('#book')}
              onClick={goHash('#book')}
              className="hidden lg:self-stretch lg:flex flex-col items-center justify-center px-5 gap-1.5 tracking-widest uppercase font-black"
              style={{ ...mixerBtn(true), minWidth: '80px', fontSize: '0.6rem', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#fff', boxShadow: '0 0 8px rgba(255,255,255,0.9)' }} />
              {t.nav.bookNow}
            </a>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col justify-center items-center gap-1.5"
              style={{ width: '40px', height: '40px' }}
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-0.5"
                  style={{
                    background: 'var(--text)',
                    transform:
                      i === 0 && menuOpen ? 'translateY(8px) rotate(45deg)'
                      : i === 2 && menuOpen ? 'translateY(-8px) rotate(-45deg)'
                      : 'none',
                    opacity: i === 1 && menuOpen ? 0 : 1,
                    transition: 'all 0.25s ease',
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile full-screen menu ── */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-center items-center lg:hidden"
        style={{
          background: 'var(--bg)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      >
        <div className="flex flex-col items-center gap-3 px-8 w-full max-w-sm">
          {links.map((l) => {
            const active = isActive(l.hash)
            return (
              <a
                key={l.hash}
                href={hrefFor(l.hash)}
                onClick={goHash(l.hash)}
                className="w-full flex items-center justify-between px-5 py-4 font-black tracking-widest uppercase"
                style={{ ...mixerBtn(active), fontSize: '0.8rem', textDecoration: 'none' }}
              >
                <span>{l.label}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: active ? '#fff' : 'var(--surface-3)',
                    boxShadow: active ? '0 0 8px rgba(255,255,255,0.9)' : 'none',
                  }}
                />
              </a>
            )
          })}

          <button
            onClick={() => { close(); openCart() }}
            className="w-full flex items-center justify-between px-5 py-4 font-black tracking-widest uppercase"
            style={{ ...mixerBtn(false), fontSize: '0.8rem' }}
          >
            <span>Cart</span>
            {count > 0 && (
              <span
                className="px-2 py-0.5 font-black"
                style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.65rem' }}
              >
                {count}
              </span>
            )}
          </button>

          <a
            href={hrefFor('#book')}
            onClick={goHash('#book')}
            className="w-full mt-2 flex items-center justify-center py-5 font-black tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            {t.nav.bookNow}
          </a>

          <Link
            href="/admin"
            onClick={close}
            className="mt-2 font-bold tracking-widest uppercase"
            style={{ color: 'var(--muted-2)', fontSize: '0.6rem' }}
          >
            Admin
          </Link>
        </div>
      </div>
    </>
  )
}
