'use client'

import { useLang } from '@/context/LangContext'

const timelineYears = ['1982', '1988', '1990s', '2000s', '2010s', '2020+']

const facts = [
  { label: 'Author', value: '"Electric Boogie"' },
  { label: 'Label', value: 'Finest Blend Recordings' },
  { label: 'Format', value: 'Vinyl First' },
  { label: 'Base', value: 'Stockholm, SE' },
  { label: 'Mixcloud', value: '@soulcorner-kennyblack' },
  { label: 'Discogs', value: 'DJ_Kenny_Black_AB' },
]

export default function About() {
  const { t } = useLang()

  return (
    <section
      id="about"
      className="relative py-28"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-screen-xl mx-auto px-10 lg:px-16">
        {/* Header */}
        <div className="mb-20">
          <p className="section-label mb-4">{t.about.label}</p>
          <div className="accent-line mb-8" />
          <h2
            className="font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text)' }}
          >
            {t.about.heading1}
            <br />
            <span style={{ color: 'var(--muted)' }}>{t.about.heading2}</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>{t.about.heading3}</span>
          </h2>
        </div>

        {/* Two column layout on desktop */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Bio */}
          <div>
            <div className="space-y-6" style={{ color: 'var(--muted)', lineHeight: '1.8' }}>
              {t.about.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Fact grid */}
            <div
              className="mt-14 grid grid-cols-2 gap-px"
              style={{ border: '1px solid var(--border)' }}
            >
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="px-4 py-3"
                  style={{
                    background: 'var(--surface-2)',
                    borderBottom: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  <p
                    className="text-xs font-semibold tracking-widest uppercase mb-1"
                    style={{ color: 'var(--muted-2)' }}
                  >
                    {f.label}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Timeline */}
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-8"
              style={{ color: 'var(--accent)' }}
            >
              {t.about.timelineLabel}
            </p>
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-12 top-0 bottom-0 w-px"
                style={{ background: 'var(--border)' }}
              />

              <div className="space-y-8">
                {t.about.timeline.map((event, i) => (
                  <div key={i} className="flex gap-6 relative">
                    {/* Year */}
                    <div className="w-24 flex-shrink-0 text-right pr-4 pt-1">
                      <span
                        className="text-xs font-black tracking-wider"
                        style={{ color: i === 0 ? 'var(--accent)' : 'var(--muted-2)' }}
                      >
                        {timelineYears[i]}
                      </span>
                    </div>

                    {/* Dot */}
                    <div className="relative flex-shrink-0 mt-1.5" style={{ zIndex: 1 }}>
                      <div
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          background: i === 0 ? 'var(--accent)' : 'var(--surface)',
                          borderColor: i === 0 ? 'var(--accent)' : 'var(--border)',
                        }}
                      />
                    </div>

                    {/* Event */}
                    <p
                      className="text-sm leading-relaxed pb-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {event}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="mt-14 flex flex-wrap gap-3">
              {[
                { label: 'Instagram', href: 'https://instagram.com/djkennyblackevent' },
                { label: 'Mixcloud', href: 'https://www.mixcloud.com/soulcorner-kennyblack/' },
                { label: 'Bandcamp', href: 'https://finestblend.bandcamp.com' },
                { label: 'Discogs', href: 'https://www.discogs.com/artist/DJ_Kenny_Black_AB' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold tracking-widest uppercase rounded border transition-all duration-200"
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
        </div>
      </div>
    </section>
  )
}
