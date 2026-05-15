'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.replace('/admin')
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 flex items-center justify-center font-black text-lg mx-auto mb-4"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            KB
          </div>
          <h1 className="font-black text-lg tracking-wider uppercase" style={{ color: 'var(--text)' }}>
            Admin Access
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            DJ Kenny Black CMS
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block font-black tracking-widest uppercase mb-2"
              style={{ color: 'var(--muted)', fontSize: '0.65rem' }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '16px',
                background: 'var(--bg)',
                border: '2px solid var(--border)',
                color: 'var(--text)',
                outline: 'none',
                letterSpacing: '0.1em',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent)' }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)' }}
            />
          </div>

          {error && (
            <p
              className="px-4 py-3 border text-sm font-bold"
              style={{ color: '#ff4444', borderColor: '#ff444430', background: '#ff444408' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-6 font-black tracking-widest uppercase transition-all duration-200"
            style={{
              background: loading || !password ? 'var(--surface-2)' : 'var(--accent)',
              color: loading || !password ? 'var(--muted)' : '#fff',
              fontSize: '0.75rem',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center" style={{ color: 'var(--muted-2)', fontSize: '0.65rem' }}>
          Set <code style={{ color: 'var(--accent)' }}>ADMIN_PASSWORD</code> in Vercel env vars
        </p>
      </div>
    </div>
  )
}
