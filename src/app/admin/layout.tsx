'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeProvider } from '@/context/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'
import { getAdminClient } from '@/lib/supabase-browser'

const navItems = [
  { href: '/admin',               label: 'Dashboard',    icon: '📊' },
  { href: '/admin/bookings',      label: 'Bookings',     icon: '📅' },
  { href: '/admin/contacts',      label: 'Messages',     icon: '✉️' },
  { href: '/admin/events',        label: 'Events',       icon: '🎵' },
  { href: '/admin/testimonials',  label: 'Testimonials', icon: '⭐' },
  { href: '/admin/services',      label: 'Services',     icon: '🎧' },
  { href: '/admin/shop/products', label: 'Products',     icon: '🛍️' },
  { href: '/admin/shop/orders',   label: 'Orders',       icon: '📦' },
  { href: '/admin/seo',            label: 'SEO & Sharing', icon: '🔍' },
  { href: '/admin/settings',      label: 'Settings',     icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingOut, setSigningOut]   = useState(false)

  // Login page — plain wrapper, no chrome
  if (pathname === '/admin/login') {
    return (
      <ThemeProvider>
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>{children}</div>
      </ThemeProvider>
    )
  }

  const signOut = async () => {
    setSigningOut(true)
    const supabase = getAdminClient()
    await supabase.auth.signOut()   // clears auth cookies, kills session
    router.replace('/admin/login')
  }

  const currentPage = navItems.find((n) => n.href === pathname)?.label || 'Admin'

  /* ── Sign-out button — shared style ── */
  const SignOutBtn = ({ wide = false }: { wide?: boolean }) => (
    <button
      onClick={signOut}
      disabled={signingOut}
      className={`flex items-center justify-center gap-2 font-bold tracking-wider transition-all duration-150 ${wide ? 'w-full py-3' : 'px-4 py-2'}`}
      style={{
        border: '1px solid var(--border)',
        color: signingOut ? 'var(--muted-2)' : 'var(--muted)',
        fontSize: '0.65rem',
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!signingOut) {
          (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'
          ;(e.currentTarget as HTMLElement).style.color = '#dc2626'
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
      }}
    >
      {/* power icon */}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
        <line x1="12" y1="2" x2="12" y2="12"/>
      </svg>
      {signingOut ? 'Signing out…' : 'Sign Out'}
    </button>
  )

  return (
    <ThemeProvider>
      <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

        {/* ── Sidebar ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
          style={{ width: '220px', background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
        >
          {/* Brand */}
          <Link
            href="/"
            className="p-4 flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div
              className="w-8 h-8 flex items-center justify-center font-black text-sm flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              KB
            </div>
            <div>
              <p className="font-black tracking-wider" style={{ color: 'var(--text)', fontSize: '0.7rem' }}>KENNY BLACK</p>
              <p style={{ color: 'var(--muted-2)', fontSize: '0.6rem' }}>CMS Admin</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 font-bold tracking-wider transition-all duration-150"
                  style={{
                    background: active ? 'var(--surface-2)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '0.72rem',
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)' }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Theme + link to site */}
            <div className="flex gap-2">
              <ThemeToggle />
              <Link
                href="/"
                className="flex-1 flex items-center justify-center py-2 font-bold tracking-wider transition-all duration-150"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.65rem' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)' }}
              >
                ↗ Site
              </Link>
            </div>
            {/* Logout — full width, clearly labelled */}
            <SignOutBtn wide />
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header */}
          <header
            className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14"
            style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          >
            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center"
              style={{ color: 'var(--muted)', fontSize: '1.1rem' }}
            >
              ☰
            </button>

            <span className="font-black tracking-wider flex-1" style={{ color: 'var(--text)', fontSize: '0.85rem' }}>
              {currentPage}
            </span>

            {/* Sign-out always visible in header */}
            <SignOutBtn />
          </header>

          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>

      </div>
    </ThemeProvider>
  )
}
