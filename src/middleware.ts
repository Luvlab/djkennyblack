import { NextRequest, NextResponse } from 'next/server'

const SESSION_SECRET = process.env.SESSION_SECRET || 'kb-session-secret-change-me'

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'))
    const dotIndex = decoded.lastIndexOf('.')
    if (dotIndex === -1) return false
    const timestamp = decoded.slice(0, dotIndex)
    const sigHex = decoded.slice(dotIndex + 1)

    const key = await getKey(SESSION_SECRET)
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(timestamp))

    if (!valid) return false
    if (Date.now() - parseInt(timestamp) > 7 * 24 * 60 * 60 * 1000) return false
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    const cookie = req.cookies.get('kb-admin')
    if (!cookie || !(await verifyToken(cookie.value))) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
