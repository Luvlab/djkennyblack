'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useLang } from '@/context/LangContext'
import { useCart } from '@/context/CartContext'

const HASH_MAP: Record<string, string> = {
  about: '#about',
  services: '#services',
  events: '#events',
  testimonials: '#testimonials',
  press: '#testimonials',
  book: '#book',
}

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

  const handleLink = () => setMenuOpen(false)

  // On home: use hash links for instant tab switching. On other pages: use /#hash to navigate home first.
  const href = (hash: string) => (isHome ? hash : `/${hash}`)

  const links = [
    { hash: '#about', label: t.nav.about },
    { hash: '#services', label: t.nav.services },
    { hash: '#events', label: t.nav.events },
    { hash: '#testimonials', label: t.nav.press },
  ]

  const isActive = (hash: string) =>
    isHome && (activeHash === hash || (hash === '' && activeHash === ''))

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'color-mix(in srgb, var(--bg) 95%, transparent)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo — clicking goes home */}
          <Link href="/#" onClick={() => { handleLink(); setActiveHash('') }} className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              KB
            </div>
            <span
              className="font-bold tracking-wider text-sm uppercase hidden sm:block"
              style={{ color: 'var(--text)' }}
            >
              Kenny Black
            </span>
          </Link>

          {/* Desktop nav tabs */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {links.map((l) => {
              const active = isActive(l.hash)
              return (
                <Link
                  key={l.hash}
                  href={href(l.hash)}
                  className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-200 relative"
                  style={{ color: active ? 'var(--text)' : 'var(--muted)' }}
                  onClick={handleLink}
                >
                  {l.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-px"
                      style={{ background: 'var(--accent)' }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Shop — separate page */}
            <Link
              href="/shop"
              className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-all duration-200"
              style={{ color: pathname.startsWith('/shop') ? 'var(--text)' : 'var(--muted)' }}
              onClick={handleLink}
            >
              Shop
              {pathname.startsWith('/shop') && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-px"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </Link>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative w-8 h-8 flex items-center justify-center"
              aria-label="Open cart"
              style={{ color: 'var(--muted)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {count > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-0.5 rounded-full font-black"
                  style={{ background: 'var(--accent)', color: '#fff', fontSize: '10px' }}
                >
                  {count}
                </span>
              )}
            </button>

            {/* Book Now CTA */}
            <Link
              href={href('#book')}
              onClick={handleLink}
              className="hidden md:flex px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {t.nav.bookNow}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5"
              aria-label="Toggle menu"
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block w-5 h-0.5 transition-all duration-300"
                  style={{
                    background: 'var(--text)',
                    transform:
                      i === 0 && menuOpen
                        ? 'translateY(6px) rotate(45deg)'
                        : i === 2 && menuOpen
                        ? 'translateY(-6px) rotate(-45deg)'
                        : 'none',
                    opacity: i === 1 && menuOpen ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-center items-center md:hidden transition-all duration-300"
        style={{
          background: 'var(--bg)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
        }}
      >
        <div className="flex flex-col items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.hash}
              href={href(l.hash)}
              onClick={handleLink}
              className="text-2xl font-black tracking-widest uppercase"
              style={{ color: isActive(l.hash) ? 'var(--accent)' : 'var(--text)' }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/shop"
            onClick={handleLink}
            className="text-2xl font-black tracking-widest uppercase"
            style={{ color: pathname.startsWith('/shop') ? 'var(--accent)' : 'var(--text)' }}
          >
            Shop
          </Link>
          <button
            onClick={() => { handleLink(); openCart() }}
            className="text-2xl font-black tracking-widest uppercase"
            style={{ color: 'var(--text)' }}
          >
            Cart {count > 0 && <span style={{ color: 'var(--accent)' }}>({count})</span>}
          </button>
          <Link
            href={href('#book')}
            onClick={handleLink}
            className="mt-2 px-8 py-3 text-sm font-bold tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {t.nav.bookNow}
          </Link>
          <Link
            href="/admin"
            onClick={handleLink}
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--muted)' }}
          >
            Admin
          </Link>
        </div>
      </div>
    </>
  )
}
