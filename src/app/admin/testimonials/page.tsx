'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Testimonial } from '@/types/database'

const empty = { client_name: '', event_type: '', message: '', rating: 5, is_featured: true }

export default function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false })
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    if (editing) {
      await supabase.from('testimonials').update(form).eq('id', editing)
    } else {
      await supabase.from('testimonials').insert(form)
    }
    await load()
    setForm(empty)
    setEditing(null)
    setShowForm(false)
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    await load()
  }

  const edit = (item: Testimonial) => {
    setEditing(item.id)
    setForm({ client_name: item.client_name, event_type: item.event_type || '', message: item.message, rating: item.rating, is_featured: item.is_featured })
    setShowForm(true)
  }

  const inputCls = `w-full px-3 py-2 text-sm rounded outline-none transition-all bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-xl" style={{ color: 'var(--text)' }}>Testimonials</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty) }}
          className="px-4 py-2 text-xs font-bold tracking-wider uppercase rounded"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['client_name', 'Client Name *'], ['event_type', 'Event Type']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
                <input value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Message *</label>
            <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={4} className={inputCls} style={{ resize: 'vertical' }} />
          </div>
          <div className="flex gap-6 items-center">
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Rating</label>
              <select value={form.rating} onChange={(e) => set('rating', parseInt(e.target.value))} className={`${inputCls} w-24`}>
                {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} ★</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-4">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="w-4 h-4" />
              <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>Featured</span>
            </label>
          </div>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase rounded"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="p-4 rounded" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{item.client_name}</span>
                  {item.event_type && <span className="text-xs" style={{ color: 'var(--muted)' }}>{item.event_type}</span>}
                  <span style={{ color: '#ffd700', fontSize: '0.7rem' }}>{'★'.repeat(item.rating)}</span>
                  {item.is_featured && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>Featured</span>}
                </div>
                <p className="text-sm italic" style={{ color: 'var(--muted)' }}>"{item.message}"</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => edit(item)} className="px-2.5 py-1 text-xs font-bold rounded" style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>Edit</button>
                <button onClick={() => del(item.id)} className="px-2.5 py-1 text-xs font-bold rounded" style={{ border: '1px solid #dc2626', color: '#dc2626' }}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
