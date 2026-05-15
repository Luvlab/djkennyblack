'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstaller() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      // Show banner after 30s
      setTimeout(() => setShown(true), 30000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
    setShown(false)
  }

  if (!shown || !prompt) return null

  return (
    <div
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 p-4 rounded shadow-xl"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-black flex-shrink-0"
          style={{ background: 'var(--accent)', color: '#fff', fontSize: '0.75rem' }}
        >
          KB
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Install App</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            Add DJ Kenny Black to your home screen for quick booking access.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              className="px-4 py-1.5 text-xs font-bold rounded"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Install
            </button>
            <button
              onClick={() => setShown(false)}
              className="px-4 py-1.5 text-xs font-bold rounded"
              style={{ border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
