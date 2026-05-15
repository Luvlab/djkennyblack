'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAILS = ['kennyblack@gmail.com', 'gordoncyrus@gmail.com']

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      setError('This email is not authorised for admin access.')
      return
    }
    setLoading(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/admin`,
      },
    })
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) { setError('Enter the 6-digit code from your email.'); return }
    setVerifying(true)
    setError('')
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: code.replace(/\s/g, ''),
      type: 'email',
    })
    if (verifyError) {
      setError(verifyError.message)
      setVerifying(false)
    } else {
      router.replace('/admin')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    outline: 'none',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm p-8"
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

        {!sent ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold tracking-widest uppercase mb-2"
                style={{ color: 'var(--muted)' }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            {error && (
              <p className="text-xs p-3 border" style={{ color: '#ff4444', borderColor: '#ff444430' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-black text-sm tracking-widest uppercase transition-all duration-200"
              style={{
                background: loading ? 'var(--surface)' : 'var(--accent)',
                color: loading ? 'var(--muted)' : '#fff',
                border: '1px solid transparent',
              }}
            >
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>

            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              kennyblack@gmail.com · gordoncyrus@gmail.com
            </p>
          </form>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="text-3xl mb-3">📬</div>
              <p className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>
                Check your inbox
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Email sent to <strong>{email}</strong>
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>or enter code</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* OTP code entry — works even if redirect URL isn't whitelisted */}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  6-Digit Code from Email
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ ...inputStyle, textAlign: 'center', letterSpacing: '0.3em', fontSize: '20px', fontWeight: 900 }}
                />
              </div>

              {error && (
                <p className="text-xs p-3 border" style={{ color: '#ff4444', borderColor: '#ff444430' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={verifying || code.length < 6}
                className="w-full py-3 font-black text-sm tracking-widest uppercase"
                style={{
                  background: verifying || code.length < 6 ? 'var(--surface)' : 'var(--accent)',
                  color: verifying || code.length < 6 ? 'var(--muted)' : '#fff',
                  border: '1px solid transparent',
                }}
              >
                {verifying ? 'Verifying…' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => { setSent(false); setCode(''); setError('') }}
              className="mt-4 w-full text-xs py-2 text-center"
              style={{ color: 'var(--muted)' }}
            >
              ← Try a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
