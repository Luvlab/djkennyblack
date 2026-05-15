'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const order: ['dark', 'light', 'system'] = ['dark', 'light', 'system']
    const next = order[(order.indexOf(theme) + 1) % 3]
    setTheme(next)
  }

  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚙️'
  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label}`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-all duration-200 text-xs font-bold tracking-wider"
      style={{
        background: 'var(--surface-2)',
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
      <span style={{ fontSize: '0.85rem' }}>{icon}</span>
    </button>
  )
}
