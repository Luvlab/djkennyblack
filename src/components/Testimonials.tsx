'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LangContext'
import type { Testimonial } from '@/types/database'

const fallback: Testimonial[] = [
  { id: '1', client_name: 'Anna & Marcus Lindström', event_type: 'Wedding', message: 'Kenny read the room perfectly from ceremony to last dance. Our guests are still talking about the music six months later. Absolutely magical.', rating: 5, is_featured: true, created_at: '' },
  { id: '2', client_name: 'Elite Hotel Marina Tower', event_type: 'Corporate After Work', message: 'We have hosted Kenny multiple times for our after-work events. He brings a level of professionalism and musical knowledge that is simply unmatched in Stockholm.', rating: 5, is_featured: true, created_at: '' },
  { id: '3', client_name: 'Sofia Bergström', event_type: 'Birthday Party', message: 'I wanted deep house and soul — Kenny delivered something far beyond what I imagined. The vinyl setup alone was a talking point all evening.', rating: 5, is_featured: true, created_at: '' },
  { id: '4', client_name: 'Medborgarplatsen Events', event_type: 'Festival', message: 'Eight hours of vinyl music that kept the crowd completely captivated. Kenny is a true master of his craft.', rating: 5, is_featured: true, created_at: '' },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>★</span>
      ))}
    </div>
  )
}

export default function Testimonials() {
  const { t } = useLang()
  const [items, setItems] = useState<Testimonial[]>(fallback)

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data)
      })
  }, [])

  return (
    <section
      id="testimonials"
      className="py-24 px-9"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="section-label mb-3">{t.testimonials.label}</p>
          <div className="accent-line mb-6" />
          <h2
            className="font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--text)' }}
          >
            {t.testimonials.heading}
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 lg:p-8 relative overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              {/* Quote mark */}
              <div
                className="absolute -top-2 -left-2 font-black select-none pointer-events-none"
                style={{
                  fontSize: '8rem',
                  lineHeight: 1,
                  color: 'rgba(255,69,0,0.06)',
                }}
              >
                "
              </div>

              <div className="relative">
                <Stars count={item.rating} />
                <blockquote
                  className="mt-4 mb-6 text-base leading-relaxed"
                  style={{ color: 'var(--text)', fontStyle: 'italic' }}
                >
                  "{item.message}"
                </blockquote>

                <div
                  className="border-t pt-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <p
                    className="font-bold text-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    {item.client_name}
                  </p>
                  {item.event_type && (
                    <p
                      className="text-xs tracking-wider uppercase mt-0.5"
                      style={{ color: 'var(--muted)' }}
                    >
                      {item.event_type}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
