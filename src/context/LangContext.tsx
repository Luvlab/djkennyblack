'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import en from '@/messages/en.json'
import sv from '@/messages/sv.json'
import es from '@/messages/es.json'
import fr from '@/messages/fr.json'
import de from '@/messages/de.json'
import ar from '@/messages/ar.json'
import zh from '@/messages/zh.json'
import ja from '@/messages/ja.json'
import pt from '@/messages/pt.json'

export type Locale = 'en' | 'sv' | 'es' | 'fr' | 'de' | 'ar' | 'zh' | 'ja' | 'pt'

export const LOCALES: { code: Locale; label: string; flag: string; dir?: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
]

const messages: Record<Locale, typeof en> = { en, sv, es, fr, de, ar: ar as typeof en, zh: zh as typeof en, ja: ja as typeof en, pt }

// Map IP country codes to default locale
const COUNTRY_LOCALE: Record<string, Locale> = {
  SE: 'sv', NO: 'sv', DK: 'sv', FI: 'sv', // Scandinavia → Swedish
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  FR: 'fr', BE: 'fr', CH: 'fr',
  DE: 'de', AT: 'de',
  SA: 'ar', AE: 'ar', EG: 'ar', JO: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar',
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  JP: 'ja',
  BR: 'pt', PT: 'pt',
}

interface LangContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: typeof en
  dir: 'ltr' | 'rtl'
}

const LangContext = createContext<LangContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: en,
  dir: 'ltr',
})

export function LangProvider({ children, geoCountry }: { children: React.ReactNode; geoCountry?: string }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const stored = localStorage.getItem('kb-locale') as Locale | null
    if (stored && messages[stored]) {
      setLocaleState(stored)
      return
    }
    // Geo-based default
    if (geoCountry && COUNTRY_LOCALE[geoCountry]) {
      setLocaleState(COUNTRY_LOCALE[geoCountry])
      return
    }
    // Browser language fallback
    const browserLang = navigator.language.split('-')[0] as Locale
    if (messages[browserLang]) {
      setLocaleState(browserLang)
    }
  }, [geoCountry])

  useEffect(() => {
    const loc = LOCALES.find((l) => l.code === locale)
    document.documentElement.lang = locale
    document.documentElement.dir = loc?.dir === 'rtl' ? 'rtl' : 'ltr'
  }, [locale])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('kb-locale', l)
  }

  const loc = LOCALES.find((l) => l.code === locale)
  const dir = loc?.dir === 'rtl' ? 'rtl' : 'ltr'

  return (
    <LangContext.Provider value={{ locale, setLocale, t: messages[locale], dir }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
