'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'

const empty = {
  title: '', venue: '', city: 'Stockholm', event_date: '',
  description: '', image_url: '', genres: [] as string[],
  is_upcoming: false, is_featured: false,
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [genreInput, setGenreInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('events').select('*').order('event_date', { ascending: false })
    setEvents(data || [])
  }
  useEffect(() => { load() }, [])

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const addGenre = () => {
    if (genreInput.trim()) {
      set('genres', [...form.genres, genreInput.trim()])
      setGenreInput('')
    }
  }

  const save = async () => {
    setSaving(true)
    if (editing) {
      await supabase.from('events').update(form).eq('id', editing)
    } else {
      await supabase.from('events').insert(form)
    }
    await load()
    setForm(empty)
    setEditing(null)
    setShowForm(false)
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    await load()
  }

  const edit = (e: Event) => {
    setEditing(e.id)
    setForm({ title: e.title, venue: e.venue, city: e.city, event_date: e.event_date, description: e.description || '', image_url: e.image_url || '', genres: e.genres || [], is_upcoming: e.is_upcoming, is_featured: e.is_featured })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputCls = `w-full px-3 py-2 text-sm rounded outline-none transition-all bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-black text-xl tracking-wider" style={{ color: 'var(--text)' }}>Events</h1>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(empty) }}
          className="px-4 py-2 text-xs font-bold tracking-wider uppercase rounded"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          {showForm ? 'Cancel' : '+ Add Event'}
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="font-bold text-sm" style={{ color: 'var(--text)' }}>
            {editing ? 'Edit Event' : 'New Event'}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[['title', 'Title *'], ['venue', 'Venue *'], ['city', 'City'], ['event_date', 'Date *'], ['description', 'Description'], ['image_url', 'Image URL']].map(([k, label]) => (
              <div key={k} className={k === 'description' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>{label}</label>
                {k === 'description'
                  ? <textarea value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} rows={3} className={inputCls} style={{ resize: 'vertical' }} />
                  : <input type={k === 'event_date' ? 'date' : 'text'} value={(form as any)[k]} onChange={(e) => set(k, e.target.value)} className={inputCls} />
                }
              </div>
            ))}
          </div>

          {/* Genres */}
          <div>
            <label className="block text-xs font-bold tracking-wider uppercase mb-1" style={{ color: 'var(--muted)' }}>Genres</label>
            <div className="flex gap-2 mb-2">
              <input value={genreInput} onChange={(e) => setGenreInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())} placeholder="Add genre..." className={`${inputCls} flex-1`} />
              <button onClick={addGenre} className="px-3 py-2 text-xs font-bold rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}>Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.genres.map((g, i) => (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  {g}
                  <button onClick={() => set('genres', form.genres.filter((_, j) => j !== i))} className="ml-1" style={{ color: 'var(--muted)' }}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            {[['is_upcoming', 'Upcoming'], ['is_featured', 'Featured']].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={(form as any)[k]} onChange={(e) => set(k, e.target.checked)} className="w-4 h-4" />
                <span className="text-xs font-bold" style={{ color: 'var(--muted)' }}>{label}</span>
              </label>
            ))}
          </div>

          <button onClick={save} disabled={saving} className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase rounded"
            style={{ background: 'var(--accent)', color: '#fff' }}>
            {saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="p-4 rounded flex items-start justify-between gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{e.title}</span>
                {e.is_upcoming && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--accent)', color: '#fff' }}>Upcoming</span>}
                {e.is_featured && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--accent)' }}>Featured</span>}
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{e.venue} · {e.city} · {e.event_date}</p>
              {e.genres && e.genres.length > 0 && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-2)' }}>{e.genres.join(' · ')}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => edit(e)} className="px-2.5 py-1 text-xs font-bold rounded" style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}>Edit</button>
              <button onClick={() => del(e.id)} className="px-2.5 py-1 text-xs font-bold rounded" style={{ border: '1px solid #dc2626', color: '#dc2626' }}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
