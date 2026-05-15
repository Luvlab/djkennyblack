'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useLang } from '@/context/LangContext'
import { useCart } from '@/context/CartContext'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHash, setActiveHash] = useState('')
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

  // For in-page hash links: prevent default + set hash directly so hashchange fires.
  // For cross-page hash links: let the browser navigate normally.
  const goHash = (hash: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    close()
    if (isHome) {
      e.preventDefault()
      window.location.hash = hash
    }
  }

  // Full href for non-home use
  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`)

  const links = [
    { hash: '#about',        label: t.nav.about },
    { hash: '#services',     label: t.nav.services },
    { hash: '#events',       label: t.nav.events },
    { hash: '#testimonials', label: t.nav.press },
    { hash: '#school',       label: t.nav.school },
    { hash: '#book',         label: t.nav.book },
    { hash: '#shop',         label: 'Shop' },
  ]

  const isActive = (hash: string) =>
    isHome && (activeHash === hash || (hash === '#about' && activeHash === ''))

  // DJ mixer button style
  const mixerBtn = (active: boolean) => ({
    background: active ? 'var(--accent)' : 'var(--surface-2)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    color: active ? '#fff' : 'var(--muted)',
    boxShadow: active
      ? '0 0 16px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.12)'
      : 'inset 0 1px 0 rgba(255,255,255,0.04)',
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
        <div className="max-w-screen-2xl mx-auto px-9 h-12 flex items-center justify-between gap-4">

          {/* Logo */}
          <a
            href="/#"
            onClick={(e) => { e.preventDefault(); close(); setActiveHash(''); if (isHome) window.location.hash = '' }}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div
              className="w-9 h-9 flex items-center justify-center font-black text-sm"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              KB
            </div>
            <span
              className="font-black tracking-widest uppercase hidden sm:block"
              style={{ color: 'var(--text)', fontSize: '0.8rem', letterSpacing: '0.15em' }}
            >
              Kenny Black
            </span>
          </a>

          {/* Desktop nav — DJ mixer channel buttons */}
          <div className="hidden lg:flex items-center gap-1.5 flex-1 justify-center">
            {links.map((l) => {
              const active = isActive(l.hash)
              return (
                <a
                  key={l.hash}
                  href={hrefFor(l.hash)}
                  onClick={goHash(l.hash)}
                  className="flex flex-col items-center justify-center px-5 py-2 gap-1.5 tracking-widest uppercase font-black"
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
                      el.style.borderColor = 'var(--border)'
                      el.style.color = 'var(--muted)'
                    }
                  }}
                >
                  {/* LED indicator */}
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

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center transition-all duration-200"
              aria-label="Open cart"
              style={{
                width: '40px',
                height: '40px',
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

            {/* Book Now CTA */}
            <a
              href={hrefFor('#book')}
              onClick={goHash('#book')}
              className="hidden lg:flex items-center justify-center px-10 py-3 font-black tracking-widest uppercase transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.65rem', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >
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

      {/* Mobile full-screen menu */}
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
