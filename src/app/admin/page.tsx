'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Stats {
  bookings: number
  pending: number
  events: number
  testimonials: number
  services: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ bookings: 0, pending: 0, events: 0, testimonials: 0, services: 0 })
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [b, e, t, s] = await Promise.all([
        supabase.from('bookings').select('id, status'),
        supabase.from('events').select('id'),
        supabase.from('testimonials').select('id'),
        supabase.from('services').select('id'),
      ])
      const pending = (b.data || []).filter((x) => x.status === 'pending').length
      setStats({
        bookings: b.data?.length || 0,
        pending,
        events: e.data?.length || 0,
        testimonials: t.data?.length || 0,
        services: s.data?.length || 0,
      })

      const { data: recent } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentBookings(recent || [])
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Bookings', value: stats.bookings, icon: '📅', href: '/admin/bookings', accent: false },
    { label: 'Pending Review', value: stats.pending, icon: '⏳', href: '/admin/bookings', accent: true },
    { label: 'Events', value: stats.events, icon: '🎵', href: '/admin/events', accent: false },
    { label: 'Testimonials', value: stats.testimonials, icon: '⭐', href: '/admin/testimonials', accent: false },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-black text-xl tracking-wider" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>DJ Kenny Black Event AB</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div
              className="p-4 rounded transition-all duration-200"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${card.accent ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{card.icon}</span>
                {card.accent && card.value > 0 && (
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                )}
              </div>
              <div className="font-black text-2xl" style={{ color: card.accent ? 'var(--accent)' : 'var(--text)' }}>
                {loading ? '…' : card.value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-sm tracking-wider" style={{ color: 'var(--text)' }}>Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs" style={{ color: 'var(--accent)' }}>
            View all →
          </Link>
        </div>
        <div
          className="rounded overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {loading ? (
            <div className="p-6 text-center text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-6 text-center text-xs" style={{ color: 'var(--muted)' }}>No bookings yet.</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                  {['Name', 'Event', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-bold tracking-wider uppercase"
                      style={{ color: 'var(--muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <td className="px-3 py-2.5 font-bold" style={{ color: 'var(--text)' }}>{b.name}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--muted)' }}>{b.event_type}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--muted)' }}>{b.event_date}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: b.status === 'confirmed' ? '#16a34a22' : b.status === 'declined' ? '#dc262622' : 'var(--surface-2)',
                          color: b.status === 'confirmed' ? '#16a34a' : b.status === 'declined' ? '#dc2626' : 'var(--muted)',
                        }}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Add Event', href: '/admin/events', icon: '➕' },
          { label: 'Add Testimonial', href: '/admin/testimonials', icon: '⭐' },
          { label: 'Site Settings', href: '/admin/settings', icon: '⚙️' },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className="p-4 rounded flex items-center gap-3 transition-all duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span>{item.icon}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
