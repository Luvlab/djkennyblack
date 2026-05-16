'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'
import { useCart } from '@/context/CartContext'

type Filter = 'all' | 'book' | 'ticket' | 'merch' | 'digital'

type BuyLink = { name: string; url: string; price?: string; note?: string }
type BookMeta = {
  subtitle?: string; author?: string; isbn?: string; publisher?: string
  year?: number; pages?: number; language?: string; format?: string
  external_only?: boolean; quote?: string; quote_by?: string
  buy_links?: BuyLink[]
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'book',    label: 'Books' },
  { key: 'ticket',  label: 'Tickets' },
  { key: 'merch',   label: 'Merch' },
  { key: 'digital', label: 'Digital' },
]

const TYPE_ICON: Record<string, string> = {
  book: '📚', ticket: '🎫', merch: '👕', digital: '⬇️',
}

export default function ShopSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter]     = useState<Filter>('all')
  const [loading, setLoading]   = useState(true)
  const { add } = useCart()

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }: { data: Product[] | null }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? products : products.filter((p) => p.type === filter)

  return (
    <section id="shop" className="py-28 min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">

        <div className="mb-20">
          <p className="section-label mb-4">Store</p>
          <h2
            className="font-black tracking-tight leading-none mb-6"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text)' }}
          >
            Shop
          </h2>
          <p className="max-w-md leading-relaxed" style={{ color: 'var(--muted)', fontSize: '1rem' }}>
            Books, event tickets, and exclusive merchandise from DJ Kenny Black.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap pb-10 mb-10" style={{ borderBottom: '1px solid var(--border)' }}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-5 py-2 text-xs font-bold tracking-widest uppercase border transition-all duration-200"
              style={{
                borderColor: filter === f.key ? 'var(--accent)' : 'var(--border)',
                color:       filter === f.key ? 'var(--accent)' : 'var(--muted)',
                background:  filter === f.key ? 'rgba(255,69,0,0.08)' : 'transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((product) => {
              const meta = product.metadata as BookMeta | null
              return meta?.external_only
                ? <BookCard key={product.id} product={product} meta={meta} />
                : <ProductCard key={product.id} product={product} onAdd={add} />
            })}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Book card — external buy links, no cart ──────────────────────────────── */
function BookCard({ product, meta }: { product: Product; meta: BookMeta }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group flex flex-col overflow-hidden border transition-all duration-300 sm:col-span-2"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <div className="grid sm:grid-cols-2 gap-0">
        {/* Cover image */}
        <Link href={`/shop/${product.slug}`} className="block overflow-hidden" style={{ background: 'var(--bg)' }}>
          <div className="aspect-[3/4] sm:aspect-auto sm:h-full flex items-center justify-center overflow-hidden" style={{ minHeight: '280px' }}>
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <span className="text-7xl opacity-10">📚</span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex flex-col p-6 gap-5">
          {/* Badge + title */}
          <div>
            <span
              className="text-xs px-2 py-0.5 font-bold uppercase tracking-wider"
              style={{ background: 'rgba(255,69,0,0.1)', color: 'var(--accent)' }}
            >
              Book
            </span>
            <Link href={`/shop/${product.slug}`}>
              <h3 className="text-lg font-black leading-tight mt-3 hover:underline" style={{ color: 'var(--text)' }}>
                {product.name}
              </h3>
            </Link>
            {meta.author && (
              <p className="text-xs font-bold mt-1 tracking-wider" style={{ color: 'var(--muted)' }}>
                av {meta.author}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {product.description}
            </p>
          )}

          {/* Quote */}
          {meta.quote && (
            <blockquote className="border-l-2 pl-4 italic" style={{ borderColor: 'var(--accent)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                &ldquo;{meta.quote}&rdquo;
              </p>
              {meta.quote_by && (
                <p className="text-xs font-bold mt-1 not-italic tracking-wider" style={{ color: 'var(--accent)' }}>
                  — {meta.quote_by}
                </p>
              )}
            </blockquote>
          )}

          {/* Book specs */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[
              { label: 'Förlag',    value: meta.publisher },
              { label: 'År',        value: meta.year?.toString() },
              { label: 'Sidor',     value: meta.pages?.toString() },
              { label: 'Språk',     value: meta.language },
              { label: 'Format',    value: meta.format },
              { label: 'ISBN',      value: meta.isbn },
            ].filter((r) => r.value).map((row) => (
              <div key={row.label}>
                <span className="block" style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>
                  {row.label}
                </span>
                <span className="block text-xs font-bold" style={{ color: 'var(--text)' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Price + buy */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-2xl" style={{ color: 'var(--accent)' }}>
                från {Math.round(product.price_sek)} SEK
              </span>
              <Link
                href={`/shop/${product.slug}`}
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--muted)' }}
              >
                Mer info →
              </Link>
            </div>

            {/* Buy links toggle */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="w-full py-3 text-sm font-black tracking-widest uppercase transition-all duration-200"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {open ? 'Stäng ▲' : 'Köp boken ▼'}
            </button>

            {open && meta.buy_links && meta.buy_links.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {meta.buy_links.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-2.5 border transition-all duration-150"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,69,0,0.06)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--bg)'
                    }}
                  >
                    <div>
                      <span className="block text-xs font-black tracking-wider uppercase" style={{ color: 'var(--text)' }}>
                        {link.name}
                      </span>
                      {link.note && (
                        <span className="block text-xs" style={{ color: 'var(--muted-2)' }}>{link.note}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {link.price && (
                        <span className="text-xs font-black" style={{ color: 'var(--accent)' }}>{link.price}</span>
                      )}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--muted)' }}>
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Standard product card ────────────────────────────────────────────────── */
function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (p: Product, vid?: string, vname?: string, qty?: number) => void
}) {
  const fmt        = (sek: number) => `${Math.round(sek)} SEK`
  const hasVariants = product.variants && product.variants.length > 0

  return (
    <div
      className="group flex flex-col overflow-hidden border transition-all duration-300"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <Link href={`/shop/${product.slug}`} className="block overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div className="aspect-square flex items-center justify-center overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-7xl opacity-10">{TYPE_ICON[product.type] || '🎵'}</span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-6 gap-5">
        <div className="flex items-start gap-2">
          <Link href={`/shop/${product.slug}`} className="flex-1">
            <h3 className="text-sm font-bold leading-tight hover:underline">{product.name}</h3>
          </Link>
          <span
            className="text-xs px-2 py-0.5 flex-shrink-0 font-bold uppercase tracking-wider"
            style={{ background: 'rgba(255,69,0,0.1)', color: 'var(--accent)' }}
          >
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </span>
        </div>

        {product.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted)' }}>
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-black text-base" style={{ color: 'var(--accent)' }}>
            {fmt(product.price_sek)}
          </span>
          {hasVariants ? (
            <Link
              href={`/shop/${product.slug}`}
              className="px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors duration-200"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              Select
            </Link>
          ) : (
            <button
              onClick={() => onAdd(product)}
              className="px-4 py-2 text-xs font-bold tracking-widest uppercase transition-opacity duration-200 hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
