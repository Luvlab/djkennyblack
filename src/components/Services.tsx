'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/context/LangContext'
import type { Service } from '@/types/database'

const iconMap: Record<string, string> = {
  headphones: '🎧',
  sparkles: '✨',
  music: '🎵',
  'graduation-cap': '🎓',
  waveform: '🎛️',
  disc: '💿',
}

const fallbackServices: Service[] = [
  { id: '1', title: 'DJ Sets', description: 'From intimate dinner parties to full festival stages — vinyl-forward, crowd-reading sets that move people. 40+ years behind the decks.', icon: 'headphones', order_index: 1 },
  { id: '2', title: 'Private Events', description: 'Weddings, corporate events, birthday celebrations. Customized playlists, world-class sound setup, and an atmosphere you will never forget.', icon: 'sparkles', order_index: 2 },
  { id: '3', title: 'Club & Bar Nights', description: 'Resident and guest slots at Stockholm\'s finest clubs, bars, and rooftop venues. Deep house, soul, funk, and old school hip hop.', icon: 'music', order_index: 3 },
  { id: '4', title: 'DJ School', description: 'Learn to DJ with Kenny Black — beginner to advanced courses for all ages. Hands-on vinyl and digital training from a true pioneer.', icon: 'graduation-cap', order_index: 4 },
  { id: '5', title: 'Music Production', description: 'Studio courses covering production, sampling, and the art of the mix. Learn from the founder of Finest Blend Recordings.', icon: 'waveform', order_index: 5 },
  { id: '6', title: 'Vinyl Marathons', description: '8-hour vinyl sessions that take you on a full musical journey. A signature experience from Stockholm\'s vinyl specialist.', icon: 'disc', order_index: 6 },
]

export default function Services() {
  const { t } = useLang()
  const [services, setServices] = useState<Service[]>(fallbackServices)

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('order_index')
      .then(({ data }) => {
        if (data && data.length > 0) setServices(data)
      })
  }, [])

  return (
    <section
      id="services"
      className="py-24 px-9"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="section-label mb-3">{t.services.label}</p>
          <div className="accent-line mb-6" />
          <h2
            className="font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--text)' }}
          >
            {t.services.heading1}
            <br />
            <span style={{ color: 'var(--accent)' }}>{t.services.heading2}</span>
          </h2>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ border: '1px solid var(--border)' }}
        >
          {services.map((service, i) => (
            <div
              key={service.id}
              className="p-6 lg:p-8 group cursor-default transition-all duration-300"
              style={{
                background: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--surface)'
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  {iconMap[service.icon || ''] || '🎵'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-black tracking-widest"
                      style={{ color: 'var(--accent)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-base mb-3"
                    style={{ color: 'var(--text)' }}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--muted)' }}
                  >
                    {service.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href="#book"
            className="inline-flex px-8 py-4 font-bold text-sm tracking-widest uppercase rounded transition-all duration-200 glow-accent"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {t.services.checkAvailability}
          </a>
        </div>
      </div>
    </section>
  )
}
