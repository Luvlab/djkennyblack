'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/types/database'
import { useCart } from '@/context/CartContext'
import Nav from '@/components/Nav'
import Link from 'next/link'

const FULFILLMENT_LABEL: Record<string, string> = {
  printful: '📦 Ships via print-on-demand (5–10 business days)',
  manual: '📮 Signed and shipped personally by Kenny Black',
  digital: '⚡ Instant digital delivery after purchase',
  ticket: '🎫 QR code ticket delivered to your email',
}

export default function ProductPage() {
  const { slug } = useParams() as { slug: string }
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { add } = useCart()

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
      .then(({ data }: { data: Product | null }) => {
        setProduct(data)
        if (data?.variants?.length) setSelectedVariant(data.variants[0])
        setLoading(false)
      })
  }, [slug])

  const handleAdd = () => {
    if (!product) return
    add(product, selectedVariant?.id, selectedVariant?.name, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const fmt = (sek: number) => `${Math.round(sek)} SEK`
  const price = selectedVariant?.price_sek ?? product?.price_sek ?? 0
  const ticketsLeft =
    product?.type === 'ticket' && product.ticket_quantity !== null
      ? Math.max(0, product.ticket_quantity - product.tickets_sold)
      : null

  if (loading) {
    return (
      <>
        <Nav />
        <div className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
          <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Loading…</p>
        </div>
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Nav />
        <div className="min-h-screen pt-14 flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Product not found.</p>
          <Link href="/shop" className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
            ← Back to Shop
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-12 pb-44" style={{ background: 'var(--bg)' }}>
        <div className="max-w-screen-lg mx-auto px-9 py-10">
          <Link
            href="/#shop"
            className="inline-block text-xs font-bold tracking-widest uppercase mb-8"
            style={{ color: 'var(--muted)' }}
          >
            ← Back to Shop
          </Link>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            {/* Image */}
            <div
              className="aspect-square rounded overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--surface)' }}
            >
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-9xl opacity-10">
                  {product.type === 'book' ? '📚' : product.type === 'ticket' ? '🎫' : '👕'}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </p>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider leading-tight">
                  {product.name}
                </h1>
              </div>

              <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>
                {fmt(price)}
              </p>

              {product.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {product.description}
                </p>
              )}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                    Option
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className="px-4 py-2 text-sm font-bold border transition-all duration-150"
                        style={{
                          borderColor: selectedVariant?.id === v.id ? 'var(--accent)' : 'var(--border)',
                          color: selectedVariant?.id === v.id ? 'var(--accent)' : 'var(--muted)',
                          background: selectedVariant?.id === v.id ? 'rgba(255,69,0,0.08)' : 'transparent',
                        }}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty */}
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Qty</p>
                <div className="flex items-center border" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-xl font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-black">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-xl font-bold"
                    style={{ color: 'var(--text)' }}
                    disabled={ticketsLeft !== null && qty >= ticketsLeft}
                  >
                    +
                  </button>
                </div>
              </div>

              {ticketsLeft !== null && (
                <p className="text-xs" style={{ color: ticketsLeft === 0 ? '#ef4444' : 'var(--muted)' }}>
                  {ticketsLeft === 0 ? 'Sold out' : `${ticketsLeft} ticket${ticketsLeft !== 1 ? 's' : ''} remaining`}
                </p>
              )}

              {/* Add to cart */}
              <button
                onClick={handleAdd}
                disabled={ticketsLeft === 0}
                className="w-full py-4 text-sm font-black tracking-widest uppercase transition-all duration-200"
                style={{
                  background: added ? '#22c55e' : ticketsLeft === 0 ? 'var(--muted)' : 'var(--accent)',
                  color: '#fff',
                  cursor: ticketsLeft === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                {ticketsLeft === 0 ? 'Sold Out' : added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>

              {/* Fulfillment note */}
              {FULFILLMENT_LABEL[product.fulfillment] && (
                <p className="text-xs pt-4" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                  {FULFILLMENT_LABEL[product.fulfillment]}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
