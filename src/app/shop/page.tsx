'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/database'
import { useCart } from '@/context/CartContext'
import Nav from '@/components/Nav'
import Link from 'next/link'

type Filter = 'all' | 'book' | 'ticket' | 'merch' | 'digital'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'book', label: 'Books' },
  { key: 'ticket', label: 'Tickets' },
  { key: 'merch', label: 'Merch' },
  { key: 'digital', label: 'Digital' },
]

const TYPE_ICON: Record<string, string> = {
  book: '📚', ticket: '🎫', merch: '👕', digital: '⬇️',
}

const TYPE_BADGE: Record<string, string> = {
  book: 'Book', ticket: 'Ticket', merch: 'Merch', digital: 'Digital',
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const { add } = useCart()

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }: { data: Product[] | null }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = filter === 'all' ? products : products.filter((p) => p.type === filter)

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-12 pb-44" style={{ background: 'var(--bg)' }}>
        {/* Header */}
        <section
          className="py-14 px-9 text-center"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            Store
          </p>
          <h1 className="text-3xl md:text-5xl font-black tracking-wider uppercase" style={{ color: 'var(--text)' }}>
            Shop
          </h1>
          <p className="mt-3 text-sm max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>
            Books, event tickets, and exclusive merchandise from DJ Kenny Black.
          </p>
        </section>

        <div className="max-w-screen-xl mx-auto px-9">
          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap py-6" style={{ borderBottom: '1px solid var(--border)' }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase border transition-all duration-200"
                style={{
                  borderColor: filter === f.key ? 'var(--accent)' : 'var(--border)',
                  color: filter === f.key ? 'var(--accent)' : 'var(--muted)',
                  background: filter === f.key ? 'rgba(255,69,0,0.08)' : 'transparent',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          {loading ? (
            <div className="py-24 text-center text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-xs tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-8">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={add} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (p: Product, vid?: string, vname?: string, qty?: number) => void
}) {
  const fmt = (sek: number) => `${Math.round(sek)} SEK`
  const hasVariants = product.variants && product.variants.length > 0

  return (
    <div
      className="group flex flex-col overflow-hidden border transition-all duration-300"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="block overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
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

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
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
              className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase border transition-colors duration-200"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              Select
            </Link>
          ) : (
            <button
              onClick={() => onAdd(product)}
              className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-opacity duration-200 hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
