'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'

export default function CartDrawer() {
  const { items, count, total, remove, setQty, clear, isOpen, closeCart } = useCart()
  const [loading, setLoading] = useState(false)

  const checkout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch {
      alert('Checkout failed. Please try again.')
      setLoading(false)
    }
  }

  const fmt = (sek: number) => `${Math.round(sek)} SEK`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
        }}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm flex flex-col transition-transform duration-300"
        style={{
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-black tracking-widest uppercase">
            Cart {count > 0 && <span style={{ color: 'var(--accent)' }}>({count})</span>}
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center text-lg"
            style={{ color: 'var(--muted)' }}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <div className="text-5xl opacity-20">🛒</div>
              <p className="text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Your cart is empty</p>
              <button
                onClick={closeCart}
                className="px-4 py-2 text-xs font-bold tracking-widest uppercase border"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.variant_id || 'default'}`}
                className="flex gap-3 pb-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {/* Thumbnail */}
                <div
                  className="w-16 h-16 flex-shrink-0 rounded overflow-hidden flex items-center justify-center"
                  style={{ background: 'var(--bg)' }}
                >
                  {item.product.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-20">
                      {item.product.type === 'book' ? '📚' : item.product.type === 'ticket' ? '🎫' : '👕'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.product.name}</p>
                  {item.variant_name && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{item.variant_name}</p>
                  )}
                  <p className="text-xs font-black mt-1" style={{ color: 'var(--accent)' }}>{fmt(item.unit_price)}</p>

                  {/* Qty + remove */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => setQty(item.product.id, item.variant_id, item.qty - 1)}
                      className="w-6 h-6 flex items-center justify-center border text-sm font-bold"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      −
                    </button>
                    <span className="text-sm w-6 text-center font-bold">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.product.id, item.variant_id, item.qty + 1)}
                      className="w-6 h-6 flex items-center justify-center border text-sm font-bold"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(item.product.id, item.variant_id)}
                      className="ml-auto text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center">
              <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span className="font-black text-lg">{fmt(total)}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Shipping calculated at checkout · Prices in SEK</p>
            <button
              onClick={checkout}
              disabled={loading}
              className="w-full py-3.5 text-sm font-black tracking-widest uppercase transition-opacity"
              style={{ background: 'var(--accent)', color: '#fff', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Redirecting…' : 'Checkout'}
            </button>
            <button
              onClick={clear}
              className="w-full py-2 text-xs tracking-widest uppercase"
              style={{ color: 'var(--muted)' }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
