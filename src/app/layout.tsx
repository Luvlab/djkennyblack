import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DJ Kenny Black — Stockholm',
  description:
    'Book DJ Kenny Black for your event. Stockholm-based DJ and music pioneer with 40+ years of experience. Deep house, soul, funk, vinyl sets, and more.',
  keywords: ['DJ Kenny Black', 'Stockholm DJ', 'boka DJ', 'wedding DJ Stockholm', 'deep house', 'soul funk DJ'],
  openGraph: {
    title: 'DJ Kenny Black — Stockholm',
    description: 'Pioneer. Vinyl specialist. 40+ years behind the decks.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080808',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#080808] text-[#f5f5f5] antialiased">
        {children}
      </body>
    </html>
  )
}
