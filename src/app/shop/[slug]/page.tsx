'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/types/database'
import { useCart } from '@/context/CartContext'
import Nav from '@/components/Nav'
import Link from 'next/link'

type BuyLink = { name: string; url: string; price?: string; note?: string }
type BookMeta = {
  subtitle?: string; author?: string; isbn?: string; publisher?: string
  year?: number; pages?: number; language?: string; format?: string
  external_only?: boolean; quote?: string; quote_by?: string
  buy_links?: BuyLink[]
}

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

          {(() => {
            const meta = product.metadata as BookMeta | null
            const isExternal = !!meta?.external_only

            return (
              <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                {/* Image */}
                <div
                  className={`overflow-hidden flex items-center justify-center ${isExternal ? 'aspect-[3/4]' : 'aspect-square rounded'}`}
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
                    <h1 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: 'var(--text)' }}>
                      {product.name}
                    </h1>
                    {meta?.author && (
                      <p className="text-sm font-bold mt-1" style={{ color: 'var(--muted)' }}>av {meta.author}</p>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {product.description}
                    </p>
                  )}

                  {/* Book metadata */}
                  {isExternal && meta && (
                    <>
                      {meta.quote && (
                        <blockquote className="border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
                          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--muted)' }}>
                            &ldquo;{meta.quote}&rdquo;
                          </p>
                          {meta.quote_by && (
                            <p className="text-xs font-black mt-1 tracking-wider not-italic" style={{ color: 'var(--accent)' }}>
                              — {meta.quote_by}
                            </p>
                          )}
                        </blockquote>
                      )}

                      <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-4 border-t border-b" style={{ borderColor: 'var(--border)' }}>
                        {[
                          { label: 'Förlag',  value: meta.publisher },
                          { label: 'År',      value: meta.year?.toString() },
                          { label: 'Sidor',   value: meta.pages ? `${meta.pages} s.` : undefined },
                          { label: 'Språk',   value: meta.language },
                          { label: 'Format',  value: meta.format },
                          { label: 'ISBN',    value: meta.isbn },
                        ].filter((r) => r.value).map((row) => (
                          <div key={row.label}>
                            <span className="block text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted-2)', fontSize: '0.6rem' }}>{row.label}</span>
                            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price */}
                      <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>
                        från {fmt(product.price_sek)}
                      </p>

                      {/* Buy links */}
                      {meta.buy_links && meta.buy_links.length > 0 && (
                        <div>
                          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--muted)' }}>
                            Köp boken
                          </p>
                          <div className="flex flex-col gap-2">
                            {meta.buy_links.map((link) => (
                              <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between px-4 py-3 border transition-all duration-150"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,69,0,0.06)'
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                                  ;(e.currentTarget as HTMLElement).style.background = 'var(--surface)'
                                }}
                              >
                                <div>
                                  <span className="block text-sm font-black tracking-wider uppercase" style={{ color: 'var(--text)' }}>
                                    {link.name}
                                  </span>
                                  {link.note && (
                                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{link.note}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {link.price && (
                                    <span className="text-sm font-black" style={{ color: 'var(--accent)' }}>{link.price}</span>
                                  )}
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted)' }}>
                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                  </svg>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Standard cart flow for non-external products */}
                  {!isExternal && (
                    <>
                      <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{fmt(price)}</p>

                      {product.variants && product.variants.length > 0 && (
                        <div>
                          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>Option</p>
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

                      <div className="flex items-center gap-4">
                        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Qty</p>
                        <div className="flex items-center border" style={{ borderColor: 'var(--border)' }}>
                          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-xl font-bold" style={{ color: 'var(--text)' }}>−</button>
                          <span className="w-10 text-center text-sm font-black">{qty}</span>
                          <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 flex items-center justify-center text-xl font-bold" style={{ color: 'var(--text)' }} disabled={ticketsLeft !== null && qty >= ticketsLeft}>+</button>
                        </div>
                      </div>

                      {ticketsLeft !== null && (
                        <p className="text-xs" style={{ color: ticketsLeft === 0 ? '#ef4444' : 'var(--muted)' }}>
                          {ticketsLeft === 0 ? 'Sold out' : `${ticketsLeft} ticket${ticketsLeft !== 1 ? 's' : ''} remaining`}
                        </p>
                      )}

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

                      {FULFILLMENT_LABEL[product.fulfillment] && (
                        <p className="text-xs pt-4" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                          {FULFILLMENT_LABEL[product.fulfillment]}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </main>
    </>
  )
}
