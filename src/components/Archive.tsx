'use client'

import { useState } from 'react'

/* ── Data ──────────────────────────────────────────────────────────────────── */

const pressItems = [
  {
    id: 'situation',
    outlet: 'Situation Sthlm',
    date: 'December 15, 2023',
    author: 'Ulf Stolt',
    headline: 'Kenneth Agibou',
    excerpt: 'Profile timed to the book launch. Covers the genesis of Electric Boogie from a Facebook thread sparked by his son — and Kenny\'s decision to self-publish 18 months of research.',
    quote: '"Hip hop found me; I didn\'t find hip hop. I believe it served as a navigator for many young people then."',
    url: 'https://www.situationsthlm.se/artikel/kenneth-agibou/',
    lang: 'sv',
    tag: 'Profile',
  },
  {
    id: 'kingsize',
    outlet: 'Kingsize Magazine',
    date: 'November 24, 2023',
    author: null,
    headline: 'Electric Boogie — när Hip Hop kom till Sverige',
    excerpt: 'News piece on the book release. Details Agibou\'s 1984 appearance on SVT\'s Bagen — the first Swedish TV program to broadcast breaking and electric boogie by children with immigrant parents.',
    quote: null,
    url: 'https://www.kingsizemag.se/noje/nya-boken-electric-boogie-nar-hip-hop-kom-till-sverige-ar-slappt/',
    lang: 'sv',
    tag: 'Book Release',
  },
  {
    id: 'ostermalm',
    outlet: 'Östermalmdirekt',
    date: 'December 16, 2023',
    author: null,
    headline: 'Kenneth var där när hiphopen föddes',
    excerpt: '"Kenneth was there when hip hop was born" — local Stockholm newspaper profile tied to the Electric Boogie book launch.',
    quote: null,
    url: 'https://www.pressreader.com/sweden/ostermalmdirekt/20231216/281835763492857',
    lang: 'sv',
    tag: 'Profile',
  },
  {
    id: 'krull',
    outlet: 'Krull Magazine',
    date: '2016',
    author: 'Kenneth Seremet',
    headline: 'Electric Boogie — A Journey Back to the Early 80s',
    excerpt: 'First-person feature about the Electric Boogie exhibition at Bromma Records/Swejazz. Covers 18 months of research: rare archive images, newspaper articles, photographs, and a 34-minute 1983 documentary screened at the show.',
    quote: null,
    url: 'https://krullmag.com/blog/electric-boogie-a-journey-back-to-the-early-80s/',
    lang: 'en',
    tag: 'Exhibition',
  },
  {
    id: 'kalmar',
    outlet: 'Kalmar Art Museum',
    date: 'Nov 3 – Dec 3, 2017',
    author: null,
    headline: 'Electric Boogie (Exhibition)',
    excerpt: 'Museum catalogue entry for the touring exhibition — "a time travel to the early 80s, chronicles how Hip Hop reached Sweden and its significance as Swedish cultural heritage." Shown at Hip Hop Weekend in Kalmar.',
    quote: '"Our streets and squares are not unsafe, nor made up of beggars and criminals. On our streets we find an exuberant creativity that deserves to be noticed."',
    url: 'https://www.kalmarkonstmuseum.se/en/exhibition/electric-boogie/',
    lang: 'en',
    tag: 'Exhibition',
  },
  {
    id: 'academia',
    outlet: 'Academia.edu',
    date: '2016',
    author: 'Kenneth Seremet & Jacob Kimvall (Konstfack)',
    headline: 'Smurf, Scratch, Break! — Descriptions of hip-hop identities in Swedish mass media during the 1980s',
    excerpt: 'Academic paper analysing ~60 Swedish newspaper articles from 1983–1989 — examining how media framed hip hop subcultural identities as the culture arrived in Sweden.',
    quote: null,
    url: 'https://independent.academia.edu/KennethSeremet',
    lang: 'en',
    tag: 'Research',
  },
]

const exhibitions = [
  { year: '2016', city: 'Stockholm', venue: 'Bromma Records / Swejazz', note: 'World premiere + 1983 documentary screening' },
  { year: '2016', city: 'Gothenburg', venue: 'Gothenburg Hip Hop Festival', note: null },
  { year: '2017', city: 'Helsinki', venue: 'Helsinki Hip Hop Festival', note: null },
  { year: '2017', city: 'Kalmar', venue: 'Kalmar Art Museum', note: 'Hip Hop Weekend' },
  { year: '2018', city: 'Malmö', venue: 'Malmö Hip Hop Weekend', note: null },
  { year: '2024', city: 'Stockholm', venue: 'Walking Tour — Drottninggatan', note: 'Jun 29 – Jul 28, from 230 SEK' },
]

const lectures = [
  { date: 'April 9, 2025', venue: 'Kungliga Biblioteket', title: 'När hiphop kom till Sverige', note: 'Free — KB "Stories" series' },
  { date: 'May 17, 2024', venue: 'Stockholms Bokhelg', title: 'När Hip Hop kom till Sverige 1982–1988', note: 'Free lecture with archive materials' },
  { date: '2023–2024', venue: 'ABF Stockholm', title: 'Hip Hop pioneer evening', note: 'Community education' },
  { date: 'Various', venue: 'Moscow & Helsinki', title: 'International seminars', note: 'Invited speaker' },
]

const youtubeVideos = [
  { title: 'Electric Boogie — 1. Intro', url: 'https://www.youtube.com/watch?v=JIJCY2o2Hf8' },
  { title: 'Electric Boogie — 2. Presentation & Discussion', url: 'https://www.youtube.com/watch?v=i19FsS6oKNY' },
  { title: 'Electric Boogie — 3. Outro', url: 'https://www.youtube.com/watch?v=DwrlcZG_qMw' },
]

const tagColors: Record<string, string> = {
  Profile: '#3b82f6',
  'Book Release': '#8b5cf6',
  Exhibition: 'var(--accent)',
  Research: '#10b981',
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function Archive() {
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const filters = ['All', 'Profile', 'Book Release', 'Exhibition', 'Research']

  const filtered = activeFilter === 'All'
    ? pressItems
    : pressItems.filter(p => p.tag === activeFilter)

  return (
    <section
      id="archive"
      className="min-h-screen py-28"
      style={{ background: 'var(--bg)' }}
    >
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6">

        {/* ── Header ── */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <p className="section-label">Archive</p>
            <span
              className="text-xs font-bold tracking-widest uppercase px-2 py-0.5"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.55rem' }}
            >
              Live Research
            </span>
          </div>
          <div className="accent-line mb-8" />
          <h2
            className="font-black leading-none tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', color: 'var(--text)' }}
          >
            Electric Boogie.
            <br />
            <span style={{ color: 'var(--muted)' }}>Swedish Hip Hop</span>
            <br />
            <span style={{ color: 'var(--accent)' }}>Our History.</span>
          </h2>
          <p
            className="max-w-2xl text-sm leading-relaxed mb-2"
            style={{ color: 'var(--muted)' }}
          >
            Kenny Black (Kenneth Agibou) leads the <strong style={{ color: 'var(--text)' }}>Swedish Hip Hop — Our History</strong> project:
            a grassroots archive with 400+ contributors documenting Sweden&apos;s hip hop origins from 1982.
            Newspaper clippings, posters, photographs, deep interviews — all preserved and presented to the world.
          </p>
          <p
            className="text-xs"
            style={{ color: 'var(--muted-2)' }}
          >
            Exhibitions in Stockholm · Gothenburg · Helsinki · Kalmar · Malmö · New York (Universal Hip Hop Museum)
          </p>
        </div>

        {/* ── Stats row ── */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-20"
          style={{ border: '1px solid var(--border)' }}
        >
          {[
            { value: '400+', label: 'Contributors' },
            { value: '18 mo', label: 'Research' },
            { value: '6+', label: 'Cities' },
            { value: '1982', label: 'Origin' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="py-6 px-5 flex flex-col items-center justify-center text-center"
              style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
            >
              <p
                className="font-black leading-none mb-1"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'var(--accent)' }}
              >
                {value}
              </p>
              <p
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--muted-2)' }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Main 2-col grid ── */}
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">

          {/* Left — Press (2/3 wide) */}
          <div className="lg:col-span-2">

            {/* Instagram highlight */}
            <div
              className="mb-10 p-6 relative overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {/* Gradient blob */}
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,69,0,0.12) 0%, transparent 70%)' }}
              />
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center font-black text-xs"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}
                >
                  IG
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black tracking-wider" style={{ color: 'var(--text)' }}>
                      @swedish_hiphop_our_history
                    </span>
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-2 py-0.5"
                      style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.5rem' }}
                    >
                      Official Archive
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                    The official Instagram archive for the project — posting rare archive photographs,
                    newspaper clippings, and historic footage documenting Swedish hip hop&apos;s origins from 1982.
                    Reel: <em>Electric Boogie — när Hip Hop kom till Sverige</em>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://www.instagram.com/swedish_hiphop_our_history/reel/DCYf6_VC952/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-150"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      <span>▶</span> Watch Reel
                    </a>
                    <a
                      href="https://www.instagram.com/swedish_hiphop_our_history/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-150"
                      style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--accent)'
                        e.currentTarget.style.color = 'var(--accent)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--muted)'
                      }}
                    >
                      Follow Archive
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Press filter */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted-2)' }}>
                Filter:
              </span>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-3 py-1 text-xs font-bold tracking-wider uppercase transition-all duration-150"
                  style={{
                    background: activeFilter === f ? 'var(--accent)' : 'var(--surface)',
                    color: activeFilter === f ? '#fff' : 'var(--muted)',
                    border: `1px solid ${activeFilter === f ? 'var(--accent)' : 'var(--border)'}`,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Press cards */}
            <div className="space-y-4">
              {filtered.map(item => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-5 group transition-all duration-150"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-black tracking-wider uppercase"
                        style={{ color: 'var(--text)' }}
                      >
                        {item.outlet}
                      </span>
                      <span
                        className="text-xs font-bold tracking-widest uppercase px-2 py-0.5"
                        style={{
                          background: `${tagColors[item.tag]}22`,
                          color: tagColors[item.tag],
                          border: `1px solid ${tagColors[item.tag]}44`,
                          fontSize: '0.5rem',
                        }}
                      >
                        {item.tag}
                      </span>
                      {item.lang === 'sv' && (
                        <span className="text-xs" style={{ color: 'var(--muted-2)' }}>🇸🇪</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: 'var(--muted-2)' }}>{item.date}</span>
                      <span
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        style={{ color: 'var(--accent)' }}
                      >
                        ↗
                      </span>
                    </div>
                  </div>

                  <p className="font-black text-sm mb-2" style={{ color: 'var(--text)', lineHeight: '1.3' }}>
                    {item.headline}
                  </p>

                  {item.author && (
                    <p className="text-xs mb-2" style={{ color: 'var(--muted-2)' }}>
                      by {item.author}
                    </p>
                  )}

                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
                    {item.excerpt}
                  </p>

                  {item.quote && (
                    <blockquote
                      className="text-xs leading-relaxed pl-3"
                      style={{
                        borderLeft: '2px solid var(--accent)',
                        color: 'var(--muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      {item.quote}
                    </blockquote>
                  )}
                </a>
              ))}
            </div>

            {/* YouTube section */}
            <div className="mt-10">
              <p
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: 'var(--accent)' }}
              >
                YouTube — Electric Boogie Playlist
              </p>
              <div className="space-y-2">
                {youtubeVideos.map(v => (
                  <a
                    key={v.url}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 group transition-all duration-150"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    }}
                  >
                    <div
                      className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs"
                      style={{ background: '#ef4444', color: '#fff' }}
                    >
                      ▶
                    </div>
                    <span
                      className="text-xs font-bold tracking-wider flex-1"
                      style={{ color: 'var(--text)' }}
                    >
                      {v.title}
                    </span>
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#ef4444' }}
                    >
                      Watch ↗
                    </span>
                  </a>
                ))}
              </div>
              <a
                href="https://www.youtube.com/playlist?list=PLqZiFq-Us6GMDpVroV94VJ_iLr-wYW373"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold tracking-wider"
                style={{ color: 'var(--muted-2)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--muted-2)'
                }}
              >
                Full playlist on YouTube →
              </a>
            </div>
          </div>

          {/* Right sidebar — 1/3 wide */}
          <div className="space-y-6">

            {/* SVT Documentary */}
            <div
              className="p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-6 h-6 flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: '#1a4580', color: '#fff' }}
                >
                  SVT
                </span>
                <p className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text)' }}>
                  SVT Play Documentary
                </p>
              </div>
              <p className="font-black text-sm mb-2" style={{ color: 'var(--text)', lineHeight: '1.3' }}>
                Den svenska hiphopens pionjärer
              </p>
              <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--muted)' }}>
                4-part documentary series (SVT, 2021). Traces Swedish hip hop from 1980s suburban Stockholm through
                the commercial explosion of the 1990s–2000s — Leila K, Petter, Timbuktu, and the pioneers who started it all.
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-2)' }}>
                Ep. 1 features breakdancing and graffiti in the suburbs — the world Kenny Black came from.
              </p>
              <a
                href="https://www.svtplay.se/den-svenska-hiphopens-pionjarer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-150 w-full justify-center"
                style={{ background: '#1a4580', color: '#fff' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.85'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.opacity = '1'
                }}
              >
                Watch on SVT Play ↗
              </a>
            </div>

            {/* Exhibition history */}
            <div
              className="p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: 'var(--accent)' }}
              >
                Exhibition Tour
              </p>
              <div className="space-y-3">
                {exhibitions.map((ex, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start"
                    style={{ borderBottom: i < exhibitions.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < exhibitions.length - 1 ? '0.75rem' : 0 }}
                  >
                    <span
                      className="text-xs font-black tracking-wider flex-shrink-0 mt-0.5"
                      style={{ color: 'var(--accent)', minWidth: '2.5rem' }}
                    >
                      {ex.year}
                    </span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                        {ex.city}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-2)' }}>
                        {ex.venue}
                      </p>
                      {ex.note && (
                        <p className="text-xs italic" style={{ color: 'var(--muted-2)', fontSize: '0.65rem' }}>
                          {ex.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 pt-4 text-xs"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-2)' }}
              >
                Also shown: Universal Hip Hop Museum, New York (Bronx)
              </div>
            </div>

            {/* Lectures */}
            <div
              className="p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: 'var(--accent)' }}
              >
                Lectures &amp; Talks
              </p>
              <div className="space-y-3">
                {lectures.map((l, i) => (
                  <div
                    key={i}
                    style={{ borderBottom: i < lectures.length - 1 ? '1px solid var(--border)' : 'none', paddingBottom: i < lectures.length - 1 ? '0.75rem' : 0 }}
                  >
                    <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                      {l.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-2)' }}>
                      {l.venue} · {l.date}
                    </p>
                    {l.note && (
                      <p className="text-xs italic" style={{ color: 'var(--muted-2)', fontSize: '0.65rem' }}>
                        {l.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Walking tour CTA */}
            <div
              className="p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, #b84000 100%)',
                border: '1px solid var(--accent)',
              }}
            >
              <div
                className="absolute -bottom-8 -right-8 font-black select-none pointer-events-none opacity-10"
                style={{ fontSize: '6rem', color: '#fff', lineHeight: 1 }}
              >
                82
              </div>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Walking Tour · Stockholm
              </p>
              <p className="font-black text-sm mb-2" style={{ color: '#fff', lineHeight: '1.3' }}>
                Electric Boogie — When Hip Hop Came to Sweden
              </p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
                Walk the iconic locations where Swedish hip hop was born. T-Centralen,
                Rinkeby, Drottninggatan — from 230 SEK.
              </p>
              <a
                href="https://billetto.se/e/electric-boogie-nar-hip-hop-kom-till-sverige-biljetter-1010461"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-black tracking-wider uppercase transition-all duration-150"
                style={{ background: '#fff', color: 'var(--accent)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.opacity = '1'
                }}
              >
                Book Walking Tour ↗
              </a>
            </div>

            {/* Podcast */}
            <div
              className="p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: 'var(--accent)' }}
              >
                Podcast
              </p>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--text)' }}>
                Svenska Breakare — Hip Hop Weekend
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>
                Kenny Black discusses Swedish breaking history, his 1984 SVT appearance in <em>Freak Out i Bagen</em>,
                and the ongoing archive research at Hip Hop Weekend in Kalmar.
              </p>
              <a
                href="https://play.acast.com/s/svenskabreakare/hip-hop-weekend-kenneth-seremet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold tracking-wider transition-all duration-150"
                style={{ color: 'var(--muted-2)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--muted-2)'
                }}
              >
                Listen on Acast →
              </a>
            </div>

            {/* Social links */}
            <div
              className="p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: 'var(--accent)' }}
              >
                Follow the Archive
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Instagram Archive', handle: '@swedish_hiphop_our_history', url: 'https://www.instagram.com/swedish_hiphop_our_history/' },
                  { label: 'Personal Instagram', handle: '@kenneth.seremet', url: 'https://www.instagram.com/kenneth.seremet/' },
                  { label: 'YouTube Channel', handle: 'Kenneth Seremet (Kenny Black)', url: 'https://www.youtube.com/c/KennethSeremetKennyBlack' },
                  { label: 'Academia.edu', handle: 'Independent Researcher', url: 'https://independent.academia.edu/KennethSeremet' },
                ].map(link => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between group transition-all duration-150"
                    style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{link.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-2)' }}>{link.handle}</p>
                    </div>
                    <span
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom CTA — The book ── */}
        <div
          className="mt-16 p-8 lg:p-12 relative overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="absolute -top-10 -right-10 font-black select-none pointer-events-none"
            style={{ fontSize: '12rem', lineHeight: 1, color: 'rgba(255,69,0,0.04)' }}
          >
            EB
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center relative">
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: 'var(--accent)' }}
              >
                The Book · 2023
              </p>
              <h3
                className="font-black leading-tight mb-4"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--text)' }}
              >
                Electric Boogie
                <br />
                <span style={{ color: 'var(--muted)' }}>När Hip Hop kom till Sverige</span>
                <br />
                <span style={{ color: 'var(--accent)', fontSize: '0.6em' }}>1982–1988</span>
              </h3>
              <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>
                Thread-bound hardcover · ~400 pages of text and photographs · Self-published via 5:e Elementet
                · ISBN 9789152722350
              </p>
              <p className="text-xs mb-6" style={{ color: 'var(--muted-2)' }}>
                &ldquo;A masterpiece — captures voices historically underrepresented in Nordic hip-hop discourse.&rdquo;
                <br />
                <span style={{ color: 'var(--muted-2)' }}>— Pär Melcherson, Swejazz</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://hlstore.com/en/books-magazines/lifestyle-culture/electric-boogie-nar-hip-hop-kom-till-sverige/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black tracking-wider uppercase transition-opacity duration-150 hover:opacity-80"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Buy the Book · 545 SEK
                </a>
                <a
                  href="#shop"
                  onClick={e => { e.preventDefault(); window.location.hash = '#shop' }}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-black tracking-wider uppercase transition-all duration-150"
                  style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.color = 'var(--accent)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--muted)'
                  }}
                >
                  View in Shop
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Format', value: 'Thread-bound hardcover' },
                { label: 'Pages', value: '~400 (text + photos)' },
                { label: 'Language', value: 'Swedish' },
                { label: 'Publisher', value: '5:e Elementet' },
                { label: 'Price', value: '545 SEK' },
                { label: 'ISBN', value: '978-91-527-2235-0' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="px-4 py-3"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: 'var(--muted-2)', fontSize: '0.55rem' }}>
                    {label}
                  </p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
