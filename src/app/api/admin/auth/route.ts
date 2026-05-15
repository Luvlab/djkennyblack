import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kenny-admin-2024'
const SESSION_SECRET = process.env.SESSION_SECRET || 'kb-session-secret-change-me'

function makeToken(): string {
  const timestamp = Date.now().toString()
  const sig = createHmac('sha256', SESSION_SECRET).update(timestamp).digest('hex')
  return Buffer.from(`${timestamp}.${sig}`).toString('base64url')
}

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = makeToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('kb-admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('kb-admin')
  return res
}
