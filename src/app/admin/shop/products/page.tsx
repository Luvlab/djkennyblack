'use client'

import { useEffect, useState } from 'react'
import { supabase as supabaseClient } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/types/database'

type Draft = Omit<Partial<Product>, 'variants'> & { variants: ProductVariant[] }

const BLANK: Draft = {
  slug: '', name: '', description: '',
  price_sek: 0, price_eur: null,
  type: 'merch', fulfillment: 'printful',
  images: [], variants: [],
  is_active: true, is_featured: false, sort_order: 0,
  event_id: null, ticket_quantity: null, digital_file_url: null,
}

const TYPE_COLOR: Record<string, string> = {
  book: '#3b82f6', ticket: '#f59e0b', merch: '#8b5cf6', digital: '#10b981',
}

function inp(
  value: string | number | undefined | null,
  onChange: (v: string) => void,
  extra?: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border rounded-none bg-transparent outline-none"
      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
      {...extra}
    />
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')

  const supabase = supabaseClient

  const load = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order')
    setProducts(data || [])
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const flash_ = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  const save = async () => {
    if (!draft) return
    setSaving(true)
    const { id, ...rest } = draft as Draft & { id?: string }
    const payload = {
      ...rest,
      images: rest.images || [],
      variants: rest.variants || [],
      metadata: {},
      printful_sync_id: null,
      printful_variant_ids: null,
      tickets_sold: 0,
    }
    if (id) {
      const { error } = await supabase.from('products').update(rest).eq('id', id)
      if (error) { flash_('Error: ' + error.message); setSaving(false); return }
      flash_('Saved.')
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('products').insert(payload as any)
      if (error) { flash_('Error: ' + error.message); setSaving(false); return }
      flash_('Created.')
    }
    setSaving(false)
    setDraft(null)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  const toggleField = async (id: string, field: 'is_active' | 'is_featured', current: boolean) => {
    const patch = field === 'is_active' ? { is_active: !current } : { is_featured: !current }
    await supabase.from('products').update(patch).eq('id', id)
    load()
  }

  const fmt = (sek: number) => `${Math.round(sek)} SEK`

  const addVariant = () => {
    if (!draft) return
    setDraft({ ...draft, variants: [...draft.variants, { id: crypto.randomUUID(), name: '' }] })
  }

  const updateVariant = (i: number, patch: Partial<ProductVariant>) => {
    if (!draft) return
    const vs = [...draft.variants]
    vs[i] = { ...vs[i], ...patch }
    setDraft({ ...draft, variants: vs })
  }

  const removeVariant = (i: number) => {
    if (!draft) return
    setDraft({ ...draft, variants: draft.variants.filter((_, j) => j !== i) })
  }

  return (
    <div className="p-4 md:p-8 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase tracking-wider">Products</h1>
        <button
          onClick={() => setDraft({ ...BLANK, variants: [] })}
          className="px-4 py-2 text-xs font-bold tracking-widest uppercase"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          + New Product
        </button>
      </div>

      {flash && (
        <p
          className="mb-4 text-sm px-3 py-2 border"
          style={{
            color: flash.startsWith('Error') ? '#ef4444' : '#22c55e',
            borderColor: flash.startsWith('Error') ? '#ef444440' : '#22c55e40',
          }}
        >
          {flash}
        </p>
      )}

      {/* Product list */}
      <div className="space-y-2">
        {products.length === 0 && (
          <p className="text-sm py-8 text-center" style={{ color: 'var(--muted)' }}>
            No products yet. Create your first one.
          </p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 p-3 border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            {/* Thumbnail */}
            <div
              className="w-12 h-12 flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: 'var(--bg)' }}
            >
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl opacity-20">
                  {p.type === 'book' ? '📚' : p.type === 'ticket' ? '🎫' : '👕'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold truncate">{p.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 font-bold"
                  style={{ background: TYPE_COLOR[p.type] + '22', color: TYPE_COLOR[p.type] }}
                >
                  {p.type}
                </span>
                {!p.is_active && (
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>inactive</span>
                )}
                {p.is_featured && (
                  <span className="text-xs" style={{ color: '#f59e0b' }}>★ featured</span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {fmt(p.price_sek)} · {p.fulfillment} · /{p.slug}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggleField(p.id, 'is_active', p.is_active)}
                className="text-xs px-2 py-1 border"
                style={{
                  borderColor: 'var(--border)',
                  color: p.is_active ? '#22c55e' : 'var(--muted)',
                }}
              >
                {p.is_active ? 'Active' : 'Off'}
              </button>
              <button
                onClick={() => setDraft({ ...p, variants: p.variants || [] })}
                className="text-xs px-2 py-1 border"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Edit
              </button>
              <button
                onClick={() => del(p.id)}
                className="text-xs px-2 py-1"
                style={{ color: '#ef4444' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / create modal */}
      {draft && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-lg my-8 p-6 space-y-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider">
                {(draft as Draft & { id?: string }).id ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setDraft(null)} style={{ color: 'var(--muted)' }}>✕</button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="label">Name *</span>
                {inp(draft.name, (v) => setDraft({ ...draft, name: v }))}
              </label>

              <label className="block">
                <span className="label">Slug *</span>
                {inp(draft.slug, (v) => setDraft({ ...draft, slug: v }), { placeholder: 'electric-boogie-book' })}
              </label>

              <label className="block">
                <span className="label">Description</span>
                <textarea
                  value={draft.description || ''}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border bg-transparent outline-none resize-y"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Price SEK *</span>
                  {inp(draft.price_sek, (v) => setDraft({ ...draft, price_sek: Number(v) }), { type: 'number', min: 0 })}
                </label>
                <label className="block">
                  <span className="label">Sort Order</span>
                  {inp(draft.sort_order, (v) => setDraft({ ...draft, sort_order: Number(v) }), { type: 'number', min: 0 })}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Type</span>
                  <select
                    value={draft.type || 'merch'}
                    onChange={(e) => setDraft({ ...draft, type: e.target.value as Product['type'] })}
                    className="w-full px-3 py-2 text-sm border bg-transparent outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <option value="book">Book</option>
                    <option value="ticket">Ticket</option>
                    <option value="merch">Merch</option>
                    <option value="digital">Digital</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label">Fulfillment</span>
                  <select
                    value={draft.fulfillment || 'manual'}
                    onChange={(e) => setDraft({ ...draft, fulfillment: e.target.value as Product['fulfillment'] })}
                    className="w-full px-3 py-2 text-sm border bg-transparent outline-none"
                    style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <option value="printful">Printful</option>
                    <option value="manual">Manual</option>
                    <option value="digital">Digital</option>
                    <option value="ticket">Ticket</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="label">Images (comma-separated URLs)</span>
                {inp(
                  (draft.images || []).join(', '),
                  (v) => setDraft({ ...draft, images: v.split(',').map((s) => s.trim()).filter(Boolean) }),
                  { placeholder: 'https://...' }
                )}
              </label>

              {draft.type === 'ticket' && (
                <label className="block">
                  <span className="label">Ticket Quantity</span>
                  {inp(draft.ticket_quantity, (v) => setDraft({ ...draft, ticket_quantity: Number(v) || null }), { type: 'number', min: 0 })}
                </label>
              )}

              {draft.type === 'digital' && (
                <label className="block">
                  <span className="label">Digital File URL</span>
                  {inp(draft.digital_file_url, (v) => setDraft({ ...draft, digital_file_url: v }), { placeholder: 'https://...' })}
                </label>
              )}

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="label">Variants</span>
                  <button onClick={addVariant} className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                    + Add
                  </button>
                </div>
                {draft.variants.map((v, i) => (
                  <div key={v.id} className="flex gap-2 mb-2">
                    <input
                      placeholder="Name (e.g. Large)"
                      value={v.name}
                      onChange={(e) => updateVariant(i, { name: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border bg-transparent outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    <input
                      placeholder="Price SEK"
                      type="number"
                      value={v.price_sek ?? ''}
                      onChange={(e) => updateVariant(i, { price_sek: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-24 px-3 py-2 text-sm border bg-transparent outline-none"
                      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                    />
                    <button onClick={() => removeVariant(i)} className="px-2 text-sm" style={{ color: '#ef4444' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={draft.is_active ?? true}
                    onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={draft.is_featured ?? false}
                    onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 py-3 text-xs font-black tracking-widest uppercase transition-opacity"
                style={{ background: 'var(--accent)', color: '#fff', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving…' : 'Save Product'}
              </button>
              <button
                onClick={() => setDraft(null)}
                className="px-5 py-3 text-xs font-bold tracking-widest uppercase border"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.label { display:block; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }`}</style>
    </div>
  )
}
