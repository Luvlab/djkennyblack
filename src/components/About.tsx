'use client'

const timeline = [
  { year: '1982', event: 'Stockholm discovers hip hop. Kenny Black is there at the beginning.' },
  { year: '1988', event: 'Publishes "Electric Boogie: When Hip Hop Came to Sweden 1982–1988"' },
  { year: '1990s', event: 'Founds Finest Blend Recordings — electro-funk inspired Detroit music' },
  { year: '2000s', event: 'Establishes Soul Corner — the definitive Stockholm deep house residency' },
  { year: '2010s', event: 'Launches DJ School — teaching the craft from vinyl up for all ages' },
  { year: '2020+', event: 'Still going. Still vinyl. Still ahead of the curve.' },
]

const facts = [
  { label: 'Author', value: '"Electric Boogie"' },
  { label: 'Label', value: 'Finest Blend Recordings' },
  { label: 'Format', value: 'Vinyl First' },
  { label: 'Base', value: 'Stockholm, SE' },
  { label: 'Mixcloud', value: '@soulcorner-kennyblack' },
  { label: 'Discogs', value: 'DJ_Kenny_Black_AB' },
]

export default function About() {
  return (
    <section
      id="about"
      className="relative py-24 px-4"
      style={{ background: 'var(--surface)' }}
    >
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="section-label mb-3">About</p>
          <div className="accent-line mb-6" />
          <h2
            className="font-black leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text)' }}
          >
            Pioneer.
            <br />
            <span style={{ color: 'var(--muted)' }}>Historian.</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>DJ.</span>
          </h2>
        </div>

        {/* Two column layout on desktop */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left: Bio */}
          <div>
            <div className="space-y-5" style={{ color: 'var(--muted)', lineHeight: '1.8' }}>
              <p>
                Kenny Black is not just a DJ — he is a chapter in Swedish music history.
                When hip hop arrived in Stockholm in 1982, Kenny was in the room. He has
                spent the four decades since preserving, documenting, and advancing the
                culture he helped build.
              </p>
              <p>
                As the founder of{' '}
                <span style={{ color: 'var(--text)' }}>Finest Blend Recordings</span>, a label
                rooted in electro-funk inspired Detroit music, and author of{' '}
                <span style={{ color: 'var(--text)', fontStyle: 'italic' }}>
                  Electric Boogie: When Hip Hop Came to Sweden
                </span>
                , Kenny brings scholarship and soul to everything he touches.
              </p>
              <p>
                Behind the decks, his approach is simple: vinyl first, crowd always. Whether
                it is a deep house marathon at an underground Stockholm club, a soulful
                after-work session at{' '}
                <span style={{ color: 'var(--text)' }}>Elite Hotel Marina Tower</span>, or an
                intimate dinner party in Södermalm — Kenny reads the room and takes you
                somewhere you did not know you wanted to go.
              </p>
              <p>
                His{' '}
                <span style={{ color: 'var(--text)' }}>DJ School</span> passes the knowledge
                forward — hands-on vinyl and digital training for beginners to advanced
                students of all ages.
              </p>
            </div>

            {/* Fact grid */}
            <div
              className="mt-10 grid grid-cols-2 gap-px"
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
              Timeline
            </p>
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-12 top-0 bottom-0 w-px"
                style={{ background: 'var(--border)' }}
              />

              <div className="space-y-8">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-6 relative">
                    {/* Year */}
                    <div
                      className="w-24 flex-shrink-0 text-right pr-4 pt-1"
                    >
                      <span
                        className="text-xs font-black tracking-wider"
                        style={{ color: i === 0 ? 'var(--accent)' : 'var(--muted-2)' }}
                      >
                        {item.year}
                      </span>
                    </div>

                    {/* Dot */}
                    <div
                      className="relative flex-shrink-0 mt-1.5"
                      style={{ zIndex: 1 }}
                    >
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
                      {item.event}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social links */}
            <div className="mt-12 flex flex-wrap gap-3">
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
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}
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
