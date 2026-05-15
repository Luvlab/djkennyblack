'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/types/database'

const iconOptions = ['headphones', 'sparkles', 'music', 'graduation-cap', 'waveform', 'disc', 'microphone', 'star']
const iconEmoji: Record<string, string> = { headphones: '🎧', sparkles: '✨', music: '🎵', 'graduation-cap': '🎓', waveform: '🎛️', disc: '💿', microphone: '🎤', star: '⭐' }

const empty = { title: '', description: '', icon: 'headphones', order_index: 0 }

export default function AdminServices() {
  const [items, setItems] = useState<Service[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('services').select('*').order('order_index')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    if (editing) {
      await supabase.from('services').update(form).eq('id', editing)
    } else {
      await supabase.from('services').insert(form)
    }
    await load()
    setForm(empty)
    setEditing(null)
    setShowForm(false)
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete service?')) return
    await supabase.from('services').delete().eq('id', id)
    await load()
  }

  const edit = (s: Service) => {
    setEditing(s.id)
    setForm({ title: s.title, description: s.description, icon: s.icon || 'headphones', order_index: s.order_index })
    setShowForm(true)
  }

  const inputCls = `w-full px-3 py-2 text-sm rounded outline-none transition-all bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-xl" style={{ color: 'var(--text)' }}>Services</h1>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty) }}
          className="px-4 py-2 text-xs font-bold tracking-wider uppercase rounded"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          {showForm ? 'Cancel' : '+ Add Service'}
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Title *</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Order</label>
              <input type="number" value={form.order_index} onChange={(e) => set('order_index', parseInt(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Description *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputCls} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((ic) => (
                <button key={ic} onClick={() => set('icon', ic)}
                  className="w-10 h-10 rounded flex items-center justify-center text-lg transition-all"
                  style={{
                    border: `2px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                    background: form.icon === ic ? 'var(--surface-2)' : 'transparent',
                  }}>
                  {iconEmoji[ic] || '🎵'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={save} disabled={saving} className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase rounded"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((s) => (
          <div key={s.id} className="p-4 rounded flex items-start justify-between gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-2xl">{iconEmoji[s.icon || ''] || '🎵'}</span>
              <div>
                <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{s.title}</span>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{s.description.substring(0, 100)}...</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => edit(s)} className="px-2.5 py-1 text-xs font-bold rounded" style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>Edit</button>
              <button onClick={() => del(s.id)} className="px-2.5 py-1 text-xs font-bold rounded" style={{ border: '1px solid #dc2626', color: '#dc2626' }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
