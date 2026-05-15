'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Booking } from '@/types/database'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#78350f22', color: '#d97706' },
  confirmed: { bg: '#16a34a22', color: '#16a34a' },
  declined: { bg: '#dc262622', color: '#dc2626' },
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'declined'>('all')

  const load = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
    setBookings(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: 'confirmed' | 'declined') => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-xl tracking-wider" style={{ color: 'var(--text)' }}>Bookings</h1>
        <div
          className="flex gap-1 p-1 rounded"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {(['all', 'pending', 'confirmed', 'declined'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded transition-all"
              style={{
                background: filter === f ? 'var(--accent)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--muted)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs" style={{ color: 'var(--muted)' }}>No bookings found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending
            return (
              <div
                key={b.id}
                className="p-4 rounded"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-sm" style={{ color: 'var(--text)' }}>{b.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: sc.bg, color: sc.color }}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                      <span>📧 {b.email}</span>
                      {b.phone && <span>📞 {b.phone}</span>}
                      <span>🎉 {b.event_type}</span>
                      <span>📅 {b.event_date}</span>
                      {b.event_location && <span>📍 {b.event_location}</span>}
                      {b.guests && <span>👥 ~{b.guests} guests</span>}
                    </div>
                    {b.message && (
                      <p className="mt-2 text-xs italic" style={{ color: 'var(--muted)' }}>
                        "{b.message}"
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-2)' }}>
                      {new Date(b.created_at).toLocaleString()}
                    </p>
                  </div>

                  {b.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateStatus(b.id, 'confirmed')}
                        className="px-3 py-1.5 text-xs font-bold rounded"
                        style={{ background: '#16a34a', color: '#fff' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'declined')}
                        className="px-3 py-1.5 text-xs font-bold rounded"
                        style={{ background: '#dc2626', color: '#fff' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
