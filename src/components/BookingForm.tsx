'use client'

import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LangContext'

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
  const { t } = useLang()
  const [form, setForm] = useState<FormState>(empty)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const eventTypeOptions = [
    { value: 'Wedding', label: t.booking.eventTypes.wedding },
    { value: 'Corporate Event', label: t.booking.eventTypes.corporate },
    { value: 'Birthday Party', label: t.booking.eventTypes.birthday },
    { value: 'Club Night', label: t.booking.eventTypes.club },
    { value: 'Bar / Restaurant', label: t.booking.eventTypes.bar },
    { value: 'Festival / Outdoor', label: t.booking.eventTypes.festival },
    { value: 'Private Party', label: t.booking.eventTypes.private },
    { value: 'After Work', label: t.booking.eventTypes.afterwork },
    { value: 'Other', label: t.booking.eventTypes.other },
  ]

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
      className="py-28"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-screen-xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: copy */}
          <div>
            <p className="section-label mb-4">{t.booking.label}</p>
            <div className="accent-line mb-8" />
            <h2
              className="font-black leading-none tracking-tight mb-8"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--text)' }}
            >
              {t.booking.heading1}
              <br />
              <span style={{ color: 'var(--accent)' }}>{t.booking.heading2}</span>
            </h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--muted)' }}>
              {t.booking.description}
            </p>

            <div className="space-y-5">
              {[
                { icon: '📍', title: t.booking.contact.base, desc: t.booking.contact.baseValue },
                { icon: '📞', title: t.booking.contact.phone, desc: '+46 73 941 40 65' },
                { icon: '✉️', title: t.booking.contact.email, desc: 'kennyblack@gmail.com' },
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
                    <p
                      className="text-xs font-bold tracking-widest uppercase mb-0.5"
                      style={{ color: 'var(--muted)' }}
                    >
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
                <div className="text-5xl mb-6" style={{ color: 'var(--accent)' }}>✓</div>
                <h3 className="font-black text-xl mb-3" style={{ color: 'var(--text)' }}>
                  {t.booking.successTitle}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {t.booking.successMessage}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-8 px-6 py-2.5 text-xs font-bold tracking-widest uppercase rounded border transition-all"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                >
                  {t.booking.submitAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row: name + email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t.booking.fields.name} *
                    </label>
                    <input
                      type="text"
                      placeholder={t.booking.fields.namePlaceholder}
                      value={form.name}
                      onChange={set('name')}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t.booking.fields.email} *
                    </label>
                    <input
                      type="email"
                      placeholder={t.booking.fields.emailPlaceholder}
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
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t.booking.fields.phone}
                    </label>
                    <input
                      type="tel"
                      placeholder={t.booking.fields.phonePlaceholder}
                      value={form.phone}
                      onChange={set('phone')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t.booking.fields.eventType} *
                    </label>
                    <select
                      value={form.event_type}
                      onChange={set('event_type')}
                      className={inputClass}
                      required
                    >
                      <option value="">Select type...</option>
                      {eventTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row: date + guests */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t.booking.fields.eventDate} *
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
                    <label
                      className="block text-xs font-bold tracking-widest uppercase mb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {t.booking.fields.guests}
                    </label>
                    <input
                      type="number"
                      placeholder={t.booking.fields.guestsPlaceholder}
                      value={form.guests}
                      onChange={set('guests')}
                      className={inputClass}
                      min="1"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label
                    className="block text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {t.booking.fields.venue}
                  </label>
                  <input
                    type="text"
                    placeholder={t.booking.fields.venuePlaceholder}
                    value={form.event_location}
                    onChange={set('event_location')}
                    className={inputClass}
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    className="block text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {t.booking.fields.message}
                  </label>
                  <textarea
                    placeholder={t.booking.fields.messagePlaceholder}
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
                  {status === 'loading' ? t.booking.sending : t.booking.submit}
                </button>

                <p className="text-xs text-center" style={{ color: 'var(--muted-2)' }}>
                  {t.booking.noPayment}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
