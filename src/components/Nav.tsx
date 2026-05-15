'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { useLang } from '@/context/LangContext'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLink = () => setMenuOpen(false)

  const links = [
    { href: '#about', label: t.nav.about },
    { href: '#services', label: t.nav.services },
    { href: '#events', label: t.nav.events },
    { href: '#testimonials', label: t.nav.press },
    { href: '#book', label: t.nav.book },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(var(--bg-rgb, 8,8,8), 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border)' : 'none',
          backgroundColor: scrolled ? 'color-mix(in srgb, var(--bg) 95%, transparent)' : 'transparent',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              KB
            </div>
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:block"
              style={{ color: 'var(--text)' }}>
              Kenny Black
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-5 flex-1 justify-center">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
                style={{ color: 'var(--muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <LanguageSwitcher />
            <a
              href="#book"
              className="hidden md:flex px-4 py-2 text-xs font-bold tracking-widest uppercase rounded transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {t.nav.bookNow}
            </a>

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
                      i === 0 && menuOpen ? 'translateY(6px) rotate(45deg)' :
                      i === 2 && menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
                    opacity: i === 1 && menuOpen ? 0 : 1,
                  }}
                />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-center items-center md:hidden transition-all duration-300"
        style={{
          background: 'var(--bg)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
        }}
      >
        <div className="flex flex-col items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={handleLink}
              className="text-2xl font-black tracking-widest uppercase"
              style={{ color: 'var(--text)' }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#book"
            onClick={handleLink}
            className="mt-4 px-8 py-3 text-sm font-bold tracking-widest uppercase rounded"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {t.nav.bookNow}
          </a>
          <Link
            href="/admin"
            onClick={handleLink}
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: 'var(--muted-2)' }}
          >
            Admin
          </Link>
        </div>
      </div>
    </>
  )
}
