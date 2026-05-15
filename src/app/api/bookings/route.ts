import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const body = await req.json()
  const { name, email, phone, event_type, event_date, event_location, guests, message } = body

  if (!name || !email || !event_type || !event_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { error } = await supabase.from('bookings').insert({
    name,
    email,
    phone: phone || null,
    event_type,
    event_date,
    event_location: event_location || null,
    guests: guests ? parseInt(guests) : null,
    message: message || null,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
