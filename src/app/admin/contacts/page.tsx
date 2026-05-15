'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContactMessage } from '@/types/database'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  new:     { bg: 'rgba(255,69,0,0.15)',  color: 'var(--accent)' },
  read:    { bg: 'var(--surface-2)',     color: 'var(--muted)' },
  replied: { bg: 'rgba(22,163,74,0.15)', color: '#16a34a' },
}

export default function AdminContacts() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filter, setFilter]     = useState<'all' | 'new' | 'read' | 'replied'>('all')

  const load = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
    setMessages(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id: string, status: ContactMessage['status']) => {
    await supabase.from('contact_messages').update({ status }).eq('id', id)
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, status } : m))
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null)
  }

  const markRead = async (msg: ContactMessage) => {
    setSelected(msg)
    if (msg.status === 'new') await setStatus(msg.id, 'read')
  }

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter)
  const newCount  = messages.filter((m) => m.status === 'new').length

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-SE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-xl tracking-wider" style={{ color: 'var(--text)' }}>Messages</h1>
          {newCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-black"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {newCount} new
            </span>
          )}
        </div>
        <div className="flex gap-1 p-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {(['all', 'new', 'read', 'replied'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 text-xs font-bold tracking-wider uppercase transition-all"
              style={{
                background: filter === f ? 'var(--accent)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--muted)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Message list */}
        <div className="space-y-0 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {loading ? (
            <div className="p-8 text-xs text-center" style={{ color: 'var(--muted)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-xs text-center" style={{ color: 'var(--muted)' }}>No messages.</div>
          ) : filtered.map((msg) => (
            <button
              key={msg.id}
              onClick={() => markRead(msg)}
              className="w-full text-left p-4 flex gap-3 transition-all duration-150"
              style={{
                background: selected?.id === msg.id ? 'var(--surface-2)' : 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                borderLeft: msg.status === 'new' ? '3px solid var(--accent)' : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== msg.id) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== msg.id) (e.currentTarget as HTMLElement).style.background = 'var(--surface)'
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-black text-xs" style={{ color: 'var(--text)' }}>
                    {msg.name}
                  </span>
                  <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider"
                    style={STATUS_STYLE[msg.status]}>
                    {msg.status}
                  </span>
                </div>
                <p className="text-xs truncate mb-1" style={{ color: 'var(--muted)' }}>
                  {msg.subject || '(no subject)'} · {msg.email}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-2)' }}>
                  {msg.message}
                </p>
              </div>
              <div className="text-xs flex-shrink-0" style={{ color: 'var(--muted-2)' }}>
                {new Date(msg.created_at).toLocaleDateString('en-SE', { day: 'numeric', month: 'short' })}
              </div>
            </button>
          ))}
        </div>

        {/* Detail pane */}
        <div style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {!selected ? (
            <div className="p-8 text-xs text-center" style={{ color: 'var(--muted-2)' }}>
              Select a message to read it
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-black text-sm" style={{ color: 'var(--text)' }}>{selected.name}</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{selected.email}</p>
                  {selected.phone && (
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{selected.phone}</p>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--muted-2)' }}>{fmt(selected.created_at)}</div>
              </div>

              {selected.subject && (
                <div className="py-2 border-t border-b" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--muted)' }}>Subject</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{selected.subject}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>Message</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                  {selected.message}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--border)' }}>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your message'}`}
                  onClick={() => setStatus(selected.id, 'replied')}
                  className="px-4 py-2 text-xs font-black tracking-widest uppercase transition-all duration-200"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Reply by Email
                </a>
                {selected.status !== 'read' && selected.status !== 'replied' && (
                  <button onClick={() => setStatus(selected.id, 'read')}
                    className="px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-all duration-200"
                    style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                      ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
                    }}
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={async () => {
                    await supabase.from('contact_messages').delete().eq('id', selected.id)
                    setMessages((prev) => prev.filter((m) => m.id !== selected.id))
                    setSelected(null)
                  }}
                  className="px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-all duration-200"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'
                    ;(e.currentTarget as HTMLElement).style.color = '#dc2626'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
