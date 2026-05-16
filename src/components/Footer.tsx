'use client'

import { useLang } from '@/context/LangContext'

const socials = [
  { label: 'Instagram', href: 'https://instagram.com/djkennyblackevent' },
  { label: 'Mixcloud', href: 'https://www.mixcloud.com/soulcorner-kennyblack/' },
  { label: 'Facebook', href: 'https://www.facebook.com/djkennyblackevent/' },
  { label: 'Bandcamp', href: 'https://finestblend.bandcamp.com' },
  { label: 'Discogs', href: 'https://www.discogs.com/artist/DJ_Kenny_Black_AB' },
]

export default function Footer() {
  const { t } = useLang()

  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      {/* Footer content */}
      <div
        className="max-w-screen-xl mx-auto px-4 lg:px-6 py-8"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                KB
              </div>
              <span
                className="font-black text-sm tracking-widest uppercase"
                style={{ color: 'var(--text)' }}
              >
                DJ Kenny Black
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              DJ Kenny Black Event AB · Stockholm, Sweden
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-2)' }}>
              +46 73 941 40 65 · kennyblack@gmail.com
            </p>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap justify-center sm:justify-end gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-bold tracking-widest uppercase rounded border transition-all duration-200"
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

        {/* Bottom bar */}
        <div
          className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--muted-2)' }}>
            © {new Date().getFullYear()} DJ Kenny Black Event AB. {t.footer.rights}
          </p>
          <p className="text-xs" style={{ color: 'var(--muted-2)' }}>
            {t.footer.tagline}
          </p>
        </div>
      </div>
    </footer>
  )
}
