'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/types/database'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function OrderConfirmPage() {
  const { id } = useParams() as { id: string }
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { clear } = useCart()

  useEffect(() => {
    const fetch = async () => {
      // Try by stripe_session_id first (success_url uses session ID)
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('stripe_session_id', id)
        .maybeSingle()
      if (data) {
        setOrder(data)
        clear()
        setLoading(false)
        return
      }
      // Fallback: try by UUID order id
      const { data: d2 } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      setOrder(d2)
      if (d2) clear()
      setLoading(false)
    }
    fetch()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <>
        <Nav />
        <div className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Loading order…</p>
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Nav />
        <div className="min-h-screen pt-14 flex flex-col items-center justify-center gap-5 px-4" style={{ background: 'var(--bg)' }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}
          >
            <span className="text-2xl" style={{ color: '#22c55e' }}>✓</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-center">Payment Confirmed</h1>
          <p className="text-sm text-center max-w-xs" style={{ color: 'var(--muted)' }}>
            Your order is being processed. You will receive a confirmation email shortly.
          </p>
          <Link
            href="/shop"
            className="px-6 py-3 text-xs font-black tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Continue Shopping
          </Link>
        </div>
      </>
    )
  }

  const fmt = (sek: number) => `${Math.round(sek)} SEK`

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-14 pb-20" style={{ background: 'var(--bg)' }}>
        <div className="max-w-screen-sm mx-auto px-4 py-12">
          {/* Success badge */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}
            >
              <span className="text-2xl" style={{ color: '#22c55e' }}>✓</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider mb-1">Order Confirmed</h1>
            <p className="text-sm font-mono" style={{ color: 'var(--muted)' }}>#{order.order_number}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              Confirmation sent to {order.customer_email}
            </p>
          </div>

          {/* Items */}
          <div className="border mb-5" style={{ borderColor: 'var(--border)' }}>
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3"
                style={{ borderBottom: i < order.items.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
                  <p className="text-sm font-semibold">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.variant_name}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>×{item.qty}</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    {fmt(item.price_sek * item.qty)}
                  </p>
                </div>
              </div>
            ))}
            <div
              className="flex justify-between p-3 font-black"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Tickets */}
          {order.ticket_codes && order.ticket_codes.length > 0 && (
            <div className="border p-4 mb-5" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-black tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
                Your Tickets
              </h3>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                QR code tickets have been sent to your email. Show at the door.
              </p>
              {order.ticket_codes.map((tc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2"
                  style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
                >
                  <span className="font-mono text-sm font-black">{tc.code}</span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>{tc.product_name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Shipping */}
          {order.shipping_address && (
            <div className="border p-4 mb-5" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                Ships To
              </h3>
              <p className="text-sm">{order.shipping_address.name}</p>
              <p className="text-sm">{order.shipping_address.line1}</p>
              {order.shipping_address.line2 && <p className="text-sm">{order.shipping_address.line2}</p>}
              <p className="text-sm">{order.shipping_address.city} {order.shipping_address.postal_code}</p>
              <p className="text-sm">{order.shipping_address.country}</p>
            </div>
          )}

          <Link
            href="/shop"
            className="block w-full py-3.5 text-center text-xs font-black tracking-widest uppercase"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    </>
  )
}
