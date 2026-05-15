'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const links = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#events', label: 'Events' },
  { href: '#testimonials', label: 'Press' },
  { href: '#book', label: 'Book' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLink = () => setMenuOpen(false)

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid #1a1a1a' : 'none',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              KB
            </div>
            <span className="font-bold tracking-wider text-sm uppercase text-white hidden sm:block">
              Kenny Black
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
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
            <a
              href="#book"
              className="px-4 py-2 text-xs font-bold tracking-widest uppercase rounded transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              Book Now
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: 'var(--text)',
                transform: menuOpen ? 'translateY(4px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: 'var(--text)',
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: 'var(--text)',
                transform: menuOpen ? 'translateY(-4px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 flex flex-col justify-center items-center transition-all duration-300 md:hidden"
        style={{
          background: 'rgba(8,8,8,0.98)',
          backdropFilter: 'blur(20px)',
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
              className="text-2xl font-bold tracking-widest uppercase"
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
            Book Now
          </a>
        </div>
      </div>
    </>
  )
}
