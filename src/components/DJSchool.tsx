'use client'

import { useLang } from '@/context/LangContext'

export default function DJSchool() {
  const { t } = useLang()
  const s = t.school

  const levels = [
    { key: 'beginner', icon: '01', color: 'var(--accent)' },
    { key: 'intermediate', icon: '02', color: '#f59e0b' },
    { key: 'advanced', icon: '03', color: '#8b5cf6' },
  ] as const

  const formats = ['private', 'group', 'vinyl'] as const

  return (
    <section className="py-20 px-5 sm:px-8 min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            {s.label}
          </p>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-wider leading-none mb-5">
            <span style={{ color: 'var(--text)' }}>{s.heading1}</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>{s.heading2}</span>
          </h2>
          <p className="max-w-lg text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            {s.description}
          </p>

          {/* Book CTA */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href="/#book"
              className="inline-flex items-center justify-center px-8 py-5 text-sm font-black tracking-widest uppercase transition-opacity duration-200 hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {s.cta}
            </a>
            <a
              href="https://hlstore.com/en/books-magazines/lifestyle-culture/dj-skolan-lar-dig-dja-med-kenny-black/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-5 text-sm font-black tracking-widest uppercase border transition-colors duration-200"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text)'
              }}
            >
              {s.buyBook}
            </a>
          </div>
        </div>

        {/* Book callout */}
        <div
          className="mb-14 p-6 sm:p-8 border flex flex-col sm:flex-row gap-6 items-start"
          style={{ borderColor: 'var(--accent)', background: 'rgba(255,69,0,0.04)' }}
        >
          <div className="text-5xl">📖</div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--accent)' }}>
              {s.bookLabel}
            </p>
            <h3 className="text-xl font-black uppercase tracking-wide mb-2" style={{ color: 'var(--text)' }}>
              DJ Skolan
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {s.bookDesc}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Course levels */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: 'var(--muted)' }}>
              {s.levels.heading}
            </h3>
            <div className="space-y-4">
              {levels.map(({ key, icon, color }) => (
                <div
                  key={key}
                  className="p-5 border transition-colors duration-200"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-black flex-shrink-0" style={{ color, fontVariantNumeric: 'tabular-nums' }}>
                      {icon}
                    </span>
                    <div>
                      <p className="font-black uppercase tracking-wider text-sm mb-1" style={{ color: 'var(--text)' }}>
                        {s.levels[key].title}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                        {s.levels[key].desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What you learn */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: 'var(--muted)' }}>
              {s.curriculum.heading}
            </h3>
            <ul className="space-y-3">
              {s.curriculum.items.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text)' }}>
                  <span className="mt-0.5 flex-shrink-0 text-xs font-black" style={{ color: 'var(--accent)' }}>
                    ◆
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Formats */}
        <div className="mt-12">
          <h3 className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: 'var(--muted)' }}>
            {s.formats.heading}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {formats.map((key) => (
              <div
                key={key}
                className="p-5 border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <p className="font-black uppercase tracking-wider text-sm mb-2" style={{ color: 'var(--text)' }}>
                  {s.formats[key].title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                  {s.formats[key].desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div
          className="mt-12 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
              Stockholm, Sweden
            </p>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              {s.contactLine}
            </p>
          </div>
          <a
            href="mailto:kennyblack@gmail.com"
            className="flex-shrink-0 px-6 py-3 text-xs font-black tracking-widest uppercase border transition-colors duration-200"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            kennyblack@gmail.com
          </a>
        </div>
      </div>
    </section>
  )
}
