'use client'

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

type FormState = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

const empty: FormState = { name: '', email: '', phone: '', subject: '', message: '' }

const SUBJECTS = [
  'General Inquiry',
  'Booking Request',
  'DJ School',
  'Press & Media',
  'Collaboration',
  'Other',
]

export default function Contact() {
  const [form, setForm]     = useState<FormState>(empty)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError]   = useState('')

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setError('Name, email and message are required.')
      return
    }
    setError('')
    setStatus('loading')
    const { error: dbErr } = await supabase.from('contact_messages').insert({
      name:    form.name,
      email:   form.email,
      phone:   form.phone || null,
      subject: form.subject || null,
      message: form.message,
    })
    if (dbErr) {
      setError('Something went wrong. Please email kennyblack@gmail.com directly.')
      setStatus('error')
    } else {
      setStatus('success')
      setForm(empty)
    }
  }

  const inputCls = `
    w-full px-5 py-4 text-sm border transition-all duration-200 outline-none
    bg-[var(--surface-2)] border-[var(--border)]
    text-[var(--text)] placeholder-[var(--muted-2)]
    focus:border-[var(--accent)]
  `

  return (
    <section id="contact" className="py-28" style={{ background: 'var(--surface)' }}>
      <div className="max-w-screen-xl mx-auto px-10 lg:px-16">

        {/* Header */}
        <div className="mb-20">
          <p className="section-label mb-4">Get in Touch</p>
          <div className="accent-line mb-8" />
          <h2 className="font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--text)' }}>
            Contact<br />
            <span style={{ color: 'var(--accent)' }}>Kenny Black</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Left: Form */}
          <div>
            {status === 'success' ? (
              <div className="p-10 border flex flex-col gap-4"
                style={{ borderColor: 'var(--accent)', background: 'rgba(255,69,0,0.04)' }}>
                <span className="text-3xl">✅</span>
                <p className="font-black uppercase tracking-wider" style={{ color: 'var(--text)' }}>Message sent!</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Thanks for reaching out. Kenny will get back to you soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 self-start px-6 py-3 text-xs font-black tracking-widest uppercase border transition-all duration-200"
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
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                      Name *
                    </label>
                    <input
                      type="text" value={form.name} onChange={set('name')}
                      placeholder="Your name" className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                      Email *
                    </label>
                    <input
                      type="email" value={form.email} onChange={set('email')}
                      placeholder="your@email.com" className={inputCls}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                      Phone
                    </label>
                    <input
                      type="tel" value={form.phone} onChange={set('phone')}
                      placeholder="+46 …" className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                      Subject
                    </label>
                    <select value={form.subject} onChange={set('subject')} className={inputCls}>
                      <option value="">Select subject…</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
                    Message *
                  </label>
                  <textarea
                    value={form.message} onChange={set('message')}
                    placeholder="What's on your mind?" rows={7}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                {error && (
                  <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-5 font-black tracking-widest uppercase text-sm transition-all duration-200"
                  style={{
                    background: status === 'loading' ? 'var(--muted-2)' : 'var(--accent)',
                    color: '#fff',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right: Contact info */}
          <div className="flex flex-col gap-8">
            <div className="space-y-6">
              {[
                {
                  icon: '📍',
                  label: 'Base',
                  value: 'Stockholm, Sweden',
                  sub: 'Available worldwide for bookings',
                },
                {
                  icon: '📞',
                  label: 'Phone',
                  value: '+46 73 941 40 65',
                  sub: 'Mon–Fri, 10:00–18:00 CET',
                },
                {
                  icon: '✉️',
                  label: 'Email',
                  value: 'kennyblack@gmail.com',
                  sub: 'Replies within 24 hours',
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-5 p-6 border"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>
                      {item.label}
                    </p>
                    <p className="font-black text-sm mb-0.5" style={{ color: 'var(--text)' }}>{item.value}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--muted)' }}>
                Follow
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Instagram', href: 'https://instagram.com/djkennyblackevent' },
                  { label: 'Mixcloud',  href: 'https://www.mixcloud.com/soulcorner-kennyblack/' },
                  { label: 'Bandcamp',  href: 'https://finestblend.bandcamp.com' },
                  { label: 'Discogs',   href: 'https://www.discogs.com/artist/DJ_Kenny_Black_AB' },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase border transition-all duration-200"
                    style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.color = 'var(--accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--muted)'
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick book */}
            <div className="p-6 border-l-4" style={{ borderColor: 'var(--accent)', background: 'var(--surface-2)' }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
                Ready to book?
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                For event bookings use the dedicated booking form — it asks all the right questions.
              </p>
              <a href="#book"
                onClick={(e) => { e.preventDefault(); window.location.hash = '#book' }}
                className="inline-flex px-6 py-3 text-xs font-black tracking-widest uppercase transition-all duration-200"
                style={{ background: 'var(--accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
              >
                Booking Form →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
