'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ThemeProvider } from '@/context/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

const ADMIN_EMAILS = ['kennyblack@gmail.com', 'gordoncyrus@gmail.com']

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { href: '/admin/events', label: 'Events', icon: '🎵' },
  { href: '/admin/testimonials', label: 'Testimonials', icon: '⭐' },
  { href: '/admin/services', label: 'Services', icon: '🎧' },
  { href: '/admin/shop/products', label: 'Products', icon: '🛍️' },
  { href: '/admin/shop/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/settings', label: 'Settings & CSS', icon: '⚙️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !ADMIN_EMAILS.includes(session.user.email || '')) {
        router.replace('/admin/login')
        return
      }
      setUser({ email: session.user.email! })
      setChecking(false)
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') router.replace('/admin/login')
      if (session && ADMIN_EMAILS.includes(session.user.email || '')) {
        setUser({ email: session.user.email! })
        setChecking(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (pathname === '/admin/login') {
    return (
      <ThemeProvider>
        <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
          {children}
        </div>
      </ThemeProvider>
    )
  }

  if (checking) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <div className="text-sm" style={{ color: 'var(--muted)' }}>Authenticating...</div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
          style={{
            width: '220px',
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
          }}
        >
          {/* Brand */}
          <div className="p-4 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              KB
            </div>
            <div>
              <p className="font-black text-xs tracking-wider" style={{ color: 'var(--text)' }}>KENNY BLACK</p>
              <p className="text-xs" style={{ color: 'var(--muted-2)' }}>CMS Admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold tracking-wider transition-all duration-150 ${active ? 'active' : ''}`}
                  style={{
                    background: active ? 'var(--surface-2)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--muted)',
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User footer */}
          <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs truncate mb-2" style={{ color: 'var(--muted)' }}>{user?.email}</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                href="/"
                className="flex-1 px-3 py-1.5 text-xs font-bold tracking-wider rounded text-center"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Site ↗
              </Link>
              <button
                onClick={signOut}
                className="flex-1 px-3 py-1.5 text-xs font-bold tracking-wider rounded"
                style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Sign Out
              </button>
            </div>
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

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header
            className="sticky top-0 z-30 flex items-center gap-3 px-4 h-14"
            style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center"
              style={{ color: 'var(--muted)' }}
            >
              ☰
            </button>
            <span className="font-bold text-sm tracking-wider" style={{ color: 'var(--text)' }}>
              {navItems.find((n) => n.href === pathname)?.label || 'Admin'}
            </span>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
