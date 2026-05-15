import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies, headers } from 'next/headers'
import { ThemeProvider } from '@/context/ThemeContext'
import { LangProvider } from '@/context/LangContext'
import PWAInstaller from '@/components/PWAInstaller'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DJ Kenny Black — Stockholm',
  description: 'Book DJ Kenny Black for your event. Stockholm-based DJ and music pioneer with 40+ years experience. Deep house, soul, funk, vinyl sets.',
  keywords: ['DJ Kenny Black', 'Stockholm DJ', 'boka DJ', 'wedding DJ Stockholm', 'deep house', 'soul funk DJ'],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DJ Kenny Black' },
  openGraph: {
    title: 'DJ Kenny Black — Stockholm',
    description: 'Pioneer. Vinyl Specialist. 40+ Years.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
    { media: '(prefers-color-scheme: light)', color: '#f7f5f2' },
  ],
}

const COUNTRY_LOCALE: Record<string, string> = {
  SE: 'sv', NO: 'sv', DK: 'sv', FI: 'sv',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  FR: 'fr', BE: 'fr',
  DE: 'de', AT: 'de',
  SA: 'ar', AE: 'ar', EG: 'ar', JO: 'ar', MA: 'ar',
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  JP: 'ja',
  BR: 'pt', PT: 'pt',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const hdrs = await headers()
  const ckStore = await cookies()

  const country = hdrs.get('x-vercel-ip-country') || hdrs.get('cf-ipcountry') || ''
  const savedLocale = ckStore.get('kb-locale')?.value
  const geoCountry = savedLocale ? '' : country

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent theme flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('kb-theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);})();` }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen antialiased" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ThemeProvider>
          <LangProvider geoCountry={geoCountry || country}>
            {children}
            <PWAInstaller />
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
