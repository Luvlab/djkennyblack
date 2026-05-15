'use client'

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'

const eventTypes = [
  'Wedding',
  'Corporate Event',
  'Birthday Party',
  'Club Night',
  'Bar / Restaurant',
  'Festival / Outdoor',
  'Private Party',
  'After Work',
  'Other',
]

type FormState = {
  name: string
  email: string
  phone: string
  event_type: string
  event_date: string
  event_location: string
  guests: string
  message: string
}

const empty: FormState = {
  name: '',
  email: '',
  phone: '',
  event_type: '',
  event_date: '',
  event_location: '',
  guests: '',
  message: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function BookingForm() {
  const [form, setForm] = useState<FormState>(empty)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.event_type || !form.event_date) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setStatus('loading')

    const { error: dbError } = await supabase.from('bookings').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      event_type: form.event_type,
      event_date: form.event_date,
      event_location: form.event_location || undefined,
      guests: form.guests ? parseInt(form.guests) : undefined,
      message: form.message || undefined,
    })

    if (dbError) {
      setError('Something went wrong. Please try again or email kennyblack@gmail.com')
      setStatus('error')
    } else {
      setStatus('success')
      setForm(empty)
    }
  }

  const inputClass = `
    w-full px-4 py-3 text-sm rounded transition-all duration-200 outline-none
    bg-[var(--surface-2)] border border-[var(--border)]
    text-[var(--text)] placeholder-[var(--muted-2)]
    focus:border-[var(--accent)]
  `

  return (
    <section
      id="book"
      className="py-24 px-5 sm:px-8"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: copy */}
          <div>
            <p className="section-label mb-3">Booking</p>
            <div className="accent-line mb-6" />
            <h2
              className="font-black leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--text)' }}
            >
              Book Kenny
              <br />
              <span style={{ color: 'var(--accent)' }}>for Your Event</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--muted)' }}>
              Fill in the form and Kenny will get back to you within 24 hours to discuss
              your event, music preferences, and pricing. No event is too intimate or
              too large.
            </p>

            <div className="space-y-4">
              {[
                { icon: '📍', title: 'Base', desc: 'Stockholm, Sweden — available nationwide' },
                { icon: '📞', title: 'Phone', desc: '+46 73 941 40 65' },
                { icon: '✉️', title: 'Email', desc: 'kennyblack@gmail.com' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 p-4"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="text-lg mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase mb-0.5"
                      style={{ color: 'var(--muted)' }}>
                      {item.title}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div>
            {status === 'success' ? (
              <div
                className="h-full flex flex-col items-center justify-center text-center py-16 px-8 rounded"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--accent)' }}
              >
                <div
                  className="text-5xl mb-6"
                  style={{ color: 'var(--accent)' }}
                >
                  ✓
                </div>
                <h3 className="font-black text-xl mb-3" style={{ color: 'var(--text)' }}>
                  Booking Request Sent!
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  Thanks for reaching out. Kenny will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-8 px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded border transition-all"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row: name + email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={set('name')}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={set('email')}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                {/* Row: phone + event type */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+46 ..."
                      value={form.phone}
                      onChange={set('phone')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}>
                      Event Type *
                    </label>
                    <select
                      value={form.event_type}
                      onChange={set('event_type')}
                      className={inputClass}
                      required
                    >
                      <option value="">Select type...</option>
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row: date + guests */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}>
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={form.event_date}
                      onChange={set('event_date')}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}>
                      Guests
                    </label>
                    <input
                      type="number"
                      placeholder="Approx. guest count"
                      value={form.guests}
                      onChange={set('guests')}
                      className={inputClass}
                      min="1"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'var(--muted)' }}>
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    placeholder="Venue name or city"
                    value={form.event_location}
                    onChange={set('event_location')}
                    className={inputClass}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'var(--muted)' }}>
                    Message / Music Preferences
                  </label>
                  <textarea
                    placeholder="Tell Kenny about your event, music taste, special requests..."
                    value={form.message}
                    onChange={set('message')}
                    rows={4}
                    className={inputClass}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: '#ff4444' }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-4 font-black text-sm tracking-widest uppercase rounded transition-all duration-200 glow-accent"
                  style={{
                    background: status === 'loading' ? 'var(--surface-2)' : 'var(--accent)',
                    color: status === 'loading' ? 'var(--muted)' : '#fff',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  }}
                >
                  {status === 'loading' ? 'Sending...' : 'Send Booking Request'}
                </button>

                <p className="text-xs text-center" style={{ color: 'var(--muted-2)' }}>
                  No payment required. Kenny will confirm availability and pricing.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
