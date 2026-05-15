'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'
import { useCart } from '@/context/CartContext'

type Filter = 'all' | 'book' | 'ticket' | 'merch' | 'digital'

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

const TYPE_BADGE: Record<string, string> = {
  book: 'Book', ticket: 'Ticket', merch: 'Merch', digital: 'Digital',
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
      <div className="max-w-screen-xl mx-auto px-5 lg:px-8">

        {/* Section header — left aligned, consistent with other sections */}
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

        {/* Product grid */}
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
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={add} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

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
            {TYPE_BADGE[product.type]}
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
