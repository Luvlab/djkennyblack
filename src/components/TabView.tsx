'use client'

import { useEffect, useState } from 'react'
import Hero from './Hero'
import About from './About'
import Services from './Services'
import Events from './Events'
import Testimonials from './Testimonials'
import BookingForm from './BookingForm'
import DJSchool from './DJSchool'

type Tab = 'home' | 'about' | 'services' | 'events' | 'testimonials' | 'school' | 'book'

const HASH_MAP: Record<string, Tab> = {
  '': 'home',
  home: 'home',
  about: 'about',
  services: 'services',
  events: 'events',
  testimonials: 'testimonials',
  press: 'testimonials',
  school: 'school',
  book: 'book',
}

function getTab(): Tab {
  if (typeof window === 'undefined') return 'home'
  return HASH_MAP[window.location.hash.slice(1)] ?? 'home'
}

export default function TabView() {
  const [active, setActive] = useState<Tab>('home')
  const [mounted, setMounted] = useState<Set<Tab>>(new Set<Tab>(['home']))

  useEffect(() => {
    const sync = () => {
      const tab = getTab()
      setActive(tab)
      setMounted((prev) => {
        if (prev.has(tab)) return prev
        return new Set([...prev, tab])
      })
      window.scrollTo(0, 0)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const panel = (tab: Tab, children: React.ReactNode) => (
    <div
      key={tab}
      style={{
        display: active === tab ? 'block' : 'none',
        animation: active === tab ? 'tabFadeIn 0.18s ease' : 'none',
      }}
    >
      {children}
    </div>
  )

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)', paddingTop: active === 'home' ? 0 : '80px' }}>
      {panel('home', <Hero />)}
      {mounted.has('about') && panel('about', <About />)}
      {mounted.has('services') && panel('services', <Services />)}
      {mounted.has('events') && panel('events', <Events />)}
      {mounted.has('testimonials') && panel('testimonials', <Testimonials />)}
      {mounted.has('school') && panel('school', <DJSchool />)}
      {mounted.has('book') && panel('book', <BookingForm />)}
    </main>
  )
}
