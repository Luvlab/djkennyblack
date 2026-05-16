import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { ThemeProvider } from '@/context/ThemeContext'
import { LangProvider } from '@/context/LangContext'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/CartDrawer'
import PWAInstaller from '@/components/PWAInstaller'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const SEO_DEFAULTS = {
  title:         "DJ Kenny Black — Stockholm's Pioneer Vinyl DJ",
  description:   'Book DJ Kenny Black for your event. Swedish hip hop pioneer, vinyl specialist and music historian. Deep house, soul, funk. 40+ years on the decks.',
  ogImage:       '',
  ogImageAlt:    'DJ Kenny Black behind the decks',
  siteUrl:       'https://djkennyblack.vercel.app',
  twitterHandle: '',
  keywords:      ['DJ Kenny Black', 'Stockholm DJ', 'boka DJ', 'deep house', 'soul funk DJ', 'vinyl DJ'],
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    )
    const { data } = await sb.from('site_settings').select('key, value')
      .in('key', ['seo_title','seo_description','seo_og_image','seo_og_image_alt',
                  'seo_canonical_url','seo_twitter_handle','seo_keywords'])

    const s: Record<string, string> = {}
    data?.forEach((d) => { if (d.value) s[d.key] = d.value })

    const title         = s.seo_title          || SEO_DEFAULTS.title
    const description   = s.seo_description    || SEO_DEFAULTS.description
    const ogImage       = s.seo_og_image        || SEO_DEFAULTS.ogImage
    const ogImageAlt    = s.seo_og_image_alt    || SEO_DEFAULTS.ogImageAlt
    const siteUrl       = s.seo_canonical_url   || SEO_DEFAULTS.siteUrl
    const twitterHandle = s.seo_twitter_handle  || SEO_DEFAULTS.twitterHandle
    const keywords      = s.seo_keywords
      ? s.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : SEO_DEFAULTS.keywords

    return {
      title,
      description,
      keywords,
      manifest: '/manifest.json',
      metadataBase: new URL(siteUrl),
      alternates: { canonical: '/' },
      appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DJ Kenny Black' },
      openGraph: {
        title,
        description,
        type: 'website',
        url: siteUrl,
        siteName: 'DJ Kenny Black',
        ...(ogImage ? { images: [{ url: ogImage, alt: ogImageAlt, width: 1200, height: 630 }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(twitterHandle ? { creator: twitterHandle, site: twitterHandle } : {}),
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    }
  } catch {
    return {
      title: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      keywords: SEO_DEFAULTS.keywords,
      manifest: '/manifest.json',
      openGraph: { title: SEO_DEFAULTS.title, description: SEO_DEFAULTS.description, type: 'website' },
    }
  }
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
            <CartProvider>
              {children}
              <CartDrawer />
              <PWAInstaller />
            </CartProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
