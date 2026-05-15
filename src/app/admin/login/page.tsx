'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error === 'Not authorized' ? 'That email is not authorized.' : 'Something went wrong, try again.')
    }
    setLoading(false)
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
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>DJ Kenny Black CMS</p>
        </div>

        {sent ? (
          <div className="text-center space-y-5">
            <div style={{ fontSize: '3rem' }}>📬</div>
            <p className="font-black tracking-wider uppercase" style={{ color: 'var(--text)', fontSize: '0.8rem' }}>
              Check your inbox
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', lineHeight: '1.6' }}>
              Magic link sent to{' '}
              <strong style={{ color: 'var(--accent)' }}>{email}</strong>.
              <br />
              Click the link in the email to sign in.
            </p>
            <p style={{ color: 'var(--muted-2)', fontSize: '0.7rem' }}>
              No email? Check your spam folder.
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-xs font-bold tracking-widest uppercase transition-colors"
              style={{ color: 'var(--muted-2)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-2)' }}
            >
              ← Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block font-black tracking-widest uppercase mb-2"
                style={{ color: 'var(--muted)', fontSize: '0.65rem' }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="your@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent)' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border)' }}
              />
            </div>

            {(error || authError) && (
              <p
                className="px-4 py-3 border text-sm font-bold"
                style={{ color: '#ff4444', borderColor: '#ff444430', background: '#ff444408' }}
              >
                {error || 'Authentication failed. Please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-6 font-black tracking-widest uppercase transition-all duration-200"
              style={{
                background: loading || !email ? 'var(--surface-2)' : 'var(--accent)',
                color: loading || !email ? 'var(--muted)' : '#fff',
                fontSize: '0.75rem',
              }}
            >
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
