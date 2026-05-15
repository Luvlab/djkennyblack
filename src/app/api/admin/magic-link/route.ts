import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_EMAILS = (
  process.env.ADMIN_EMAILS || 'gordoncyrus@gmail.com,kennyblack@gmail.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase())

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || !ALLOWED_EMAILS.includes(email.toLowerCase())) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      shouldCreateUser: true,
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
