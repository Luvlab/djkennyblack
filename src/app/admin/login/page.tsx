'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAILS = ['kennyblack@gmail.com', 'gordoncyrus@gmail.com']

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      setError('This email is not authorised for admin access.')
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  const inputClass = `
    w-full px-4 py-3 text-sm rounded outline-none transition-all duration-200
    bg-[var(--surface-2)] border border-[var(--border)]
    text-[var(--text)] placeholder-[var(--muted-2)]
    focus:border-[var(--accent)]
  `

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg mx-auto mb-3"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            KB
          </div>
          <h1 className="font-black text-lg tracking-wider" style={{ color: 'var(--text)' }}>
            Admin Access
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            DJ Kenny Black CMS
          </p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-4">📬</div>
            <p className="font-bold mb-2" style={{ color: 'var(--text)' }}>Check your inbox</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Magic link sent to <strong>{email}</strong>
            </p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-6 text-xs underline"
              style={{ color: 'var(--muted)' }}
            >
              Try a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: 'var(--muted)' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {error && <p className="text-xs" style={{ color: '#ff4444' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-black text-sm tracking-widest uppercase rounded transition-all duration-200"
              style={{
                background: loading ? 'var(--surface-2)' : 'var(--accent)',
                color: loading ? 'var(--muted)' : '#fff',
              }}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--muted-2)' }}>
              Authorised admins only: kennyblack@gmail.com · gordoncyrus@gmail.com
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
