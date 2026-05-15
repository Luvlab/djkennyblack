'use client'

import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const order: ['dark', 'light', 'system'] = ['dark', 'light', 'system']
    setTheme(order[(order.indexOf(theme) + 1) % 3])
  }

  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '⚙️'
  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label}`}
      className="flex items-center justify-center transition-all duration-200"
      style={{
        width: '40px',
        height: '40px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        fontSize: '0.95rem',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--accent)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--muted)'
      }}
    >
      {icon}
    </button>
  )
}
