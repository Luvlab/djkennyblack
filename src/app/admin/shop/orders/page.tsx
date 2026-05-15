'use client'

import { useEffect, useState } from 'react'
import { supabase as supabaseClient } from '@/lib/supabase'
import type { Order } from '@/types/database'

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  paid: '#3b82f6',
  fulfilled: '#22c55e',
  refunded: '#8b5cf6',
  cancelled: '#ef4444',
}

const STATUS_LIST = ['pending', 'paid', 'fulfilled', 'refunded', 'cancelled'] as Order['status'][]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  const supabase = supabaseClient

  const load = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: Order['status']) => {
    setUpdating(true)
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    setUpdating(false)
    load()
    if (selected?.id === id) setSelected((o) => o ? { ...o, status } : o)
  }

  const fmt = (sek: number) => `${Math.round(sek)} SEK`

  return (
    <div className="p-4 md:p-8 max-w-screen-xl mx-auto">
      <h1 className="text-xl font-black uppercase tracking-wider mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-2 text-xs font-bold tracking-widest uppercase"
                    style={{ color: 'var(--muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer transition-colors duration-150"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onClick={() => setSelected(o)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-3 px-2 font-mono text-xs font-bold">{o.order_number}</td>
                  <td className="py-3 px-2">
                    <p className="text-sm font-semibold">{o.customer_name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{o.customer_email}</p>
                  </td>
                  <td className="py-3 px-2 text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-2 text-xs" style={{ color: 'var(--muted)' }}>
                    {o.items.length}
                  </td>
                  <td className="py-3 px-2 font-bold">{fmt(o.total)}</td>
                  <td className="py-3 px-2">
                    <span
                      className="text-xs px-2 py-0.5 font-bold"
                      style={{
                        background: STATUS_COLOR[o.status] + '22',
                        color: STATUS_COLOR[o.status],
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-xs" style={{ color: 'var(--accent)' }}>View →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail panel */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            className="w-full max-w-lg my-8 p-6 space-y-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wider">#{selected.order_number}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-lg" style={{ color: 'var(--muted)' }}>
                ✕
              </button>
            </div>

            {/* Customer */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                ['Customer', selected.customer_name],
                ['Email', selected.customer_email],
                ['Phone', selected.customer_phone || '—'],
                ['Total', fmt(selected.total)],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ color: 'var(--muted)' }}>{k}</p>
                  <p className="font-bold mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {/* Shipping */}
            {selected.shipping_address && (
              <div
                className="text-xs p-3"
                style={{ border: '1px solid var(--border)' }}
              >
                <p className="font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                  Ship To
                </p>
                <p>{selected.shipping_address.name}</p>
                <p>{selected.shipping_address.line1}{selected.shipping_address.line2 ? `, ${selected.shipping_address.line2}` : ''}</p>
                <p>{selected.shipping_address.city} {selected.shipping_address.postal_code}, {selected.shipping_address.country}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--muted)' }}
              >
                Items
              </p>
              {selected.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 text-xs"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span>
                    {item.product_name}
                    {item.variant_name ? ` — ${item.variant_name}` : ''} ×{item.qty}
                  </span>
                  <span style={{ color: 'var(--accent)' }}>{Math.round(item.price_sek * item.qty)} SEK</span>
                </div>
              ))}
              <div className="flex justify-between py-2 text-sm font-black">
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{fmt(selected.total)}</span>
              </div>
            </div>

            {/* Tickets */}
            {selected.ticket_codes && selected.ticket_codes.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
                  Tickets
                </p>
                {selected.ticket_codes.map((tc, i) => (
                  <div
                    key={i}
                    className="flex justify-between py-1.5 text-xs"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <span className="font-mono font-bold">{tc.code}</span>
                    <span style={{ color: tc.used ? '#22c55e' : 'var(--muted)' }}>
                      {tc.used ? '✓ Used' : 'Valid'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Printful */}
            {selected.printful_order_id && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Printful order: <span className="font-mono">{selected.printful_order_id}</span>
              </p>
            )}

            {/* Status update */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
                Update Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_LIST.map((s) => (
                  <button
                    key={s}
                    disabled={updating}
                    onClick={() => updateStatus(selected.id, s)}
                    className="px-3 py-1.5 text-xs font-bold border transition-all"
                    style={{
                      borderColor: selected.status === s ? STATUS_COLOR[s] : 'var(--border)',
                      color: selected.status === s ? STATUS_COLOR[s] : 'var(--muted)',
                      background: selected.status === s ? STATUS_COLOR[s] + '15' : 'transparent',
                      opacity: updating ? 0.6 : 1,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
