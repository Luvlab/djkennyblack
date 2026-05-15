import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import type { Database, OrderItem } from '@/types/database'
import QRCode from 'qrcode'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function orderNumber() {
  const d = new Date()
  return `KB${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    Math.floor(Math.random() * 9000) + 1000
  )}`
}

function ticketCode() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `TKT-${seg()}-${seg()}`
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    try {
      await handleCompleted(event.data.object as Stripe.Checkout.Session)
    } catch (e) {
      console.error('Webhook handler error:', e)
    }
  }

  return NextResponse.json({ received: true })
}

async function handleCompleted(session: Stripe.Checkout.Session) {
  // Reconstruct cart from split metadata
  const raw = (session.metadata?.cart || '') + (session.metadata?.cart2 || '')
  const cartPayload: Array<{
    pid: string; pname: string; vid: string; vname: string
    qty: number; price: number; type: string; ful: string
  }> = JSON.parse(raw || '[]')

  const items: OrderItem[] = cartPayload.map((c) => ({
    product_id: c.pid,
    product_name: c.pname,
    variant_id: c.vid || undefined,
    variant_name: c.vname || undefined,
    qty: c.qty,
    price_sek: c.price,
    type: c.type,
    fulfillment: c.ful,
  }))

  const ticketItems = items.filter((i) => i.type === 'ticket')
  const ticketCodes = ticketItems.flatMap((i) =>
    Array.from({ length: i.qty }, () => ({
      code: ticketCode(),
      product_id: i.product_id,
      product_name: i.product_name,
      used: false,
      issued_at: new Date().toISOString(),
    }))
  )

  const subtotal = (session.amount_subtotal || 0) / 100
  const shipping = (session.total_details?.amount_shipping || 0) / 100
  const total = (session.amount_total || 0) / 100

  const shipInfo = session.collected_information?.shipping_details
  const addr = shipInfo?.address
  const shippingAddress = addr
    ? {
        name: shipInfo?.name || session.customer_details?.name || '',
        line1: addr.line1 || '',
        line2: addr.line2 || undefined,
        city: addr.city || '',
        postal_code: addr.postal_code || '',
        country: addr.country || '',
      }
    : null

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber(),
      customer_name: session.customer_details?.name || 'Customer',
      customer_email: session.customer_details?.email || session.customer_email || '',
      customer_phone: session.customer_details?.phone || null,
      shipping_address: shippingAddress,
      items,
      subtotal,
      shipping,
      total,
      currency: 'sek',
      status: 'paid',
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === 'string' ? session.payment_intent : null,
      ticket_codes: ticketCodes,
    })
    .select()
    .single()

  if (error || !order) {
    console.error('Order insert error:', error)
    return
  }

  // Printful fulfillment for merch items with shipping address
  const printfulItems = items.filter((i) => i.fulfillment === 'printful')
  if (printfulItems.length && shippingAddress) {
    await submitPrintfulOrder(order, printfulItems, shippingAddress)
  }

  // Email confirmation
  await sendEmail(order, ticketCodes)
}

async function submitPrintfulOrder(
  order: { id: string; order_number: string; customer_email: string },
  items: OrderItem[],
  address: { name: string; line1: string; line2?: string; city: string; postal_code: string; country: string }
) {
  try {
    const res = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: order.order_number,
        shipping: 'STANDARD',
        recipient: {
          name: address.name,
          address1: address.line1,
          address2: address.line2 || '',
          city: address.city,
          zip: address.postal_code,
          country_code: address.country,
          email: order.customer_email,
        },
        items: items.map((i) => ({
          external_variant_id: i.printful_id || i.variant_id || i.product_id,
          quantity: i.qty,
        })),
      }),
    })
    const data = await res.json()
    if (data.result?.id) {
      await supabase
        .from('orders')
        .update({ printful_order_id: String(data.result.id) })
        .eq('id', order.id)
    }
  } catch (e) {
    console.error('Printful order failed:', e)
  }
}

async function sendEmail(
  order: {
    order_number: string
    customer_name: string
    customer_email: string
    items: OrderItem[]
    total: number
    stripe_session_id: string | null
  },
  ticketCodes: Array<{ code: string; product_name: string }>
) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

    let ticketHtml = ''
    if (ticketCodes.length > 0) {
      const qrImages = await Promise.all(
        ticketCodes.map((tc) => QRCode.toDataURL(tc.code, { width: 200 }))
      )
      ticketHtml = `
        <h3 style="color:#ff4500;margin-top:24px;">Your Tickets</h3>
        ${ticketCodes
          .map(
            (tc, i) => `
          <div style="margin-bottom:16px;padding:12px;border:1px solid #333;">
            <p style="font-family:monospace;font-size:18px;font-weight:bold;margin:0 0 8px;">${tc.code}</p>
            <p style="margin:0 0 8px;color:#888;">${tc.product_name}</p>
            <img src="${qrImages[i]}" width="160" alt="QR Code" />
          </div>`
          )
          .join('')}
        <p style="color:#888;font-size:12px;">Show this QR code at the door. Save this email.</p>
      `
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://djkennyblack.vercel.app'
    const orderUrl = `${siteUrl}/shop/order/${order.stripe_session_id}`

    await transporter.sendMail({
      from: `DJ Kenny Black <${process.env.EMAIL_FROM}>`,
      to: order.customer_email,
      subject: `Order Confirmed — ${order.order_number}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#080808;color:#f0f0f0;padding:32px;">
          <div style="margin-bottom:24px;">
            <div style="width:48px;height:48px;background:#ff4500;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#fff;">KB</div>
          </div>
          <h1 style="color:#ff4500;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">Order Confirmed</h1>
          <p>Hi ${order.customer_name},</p>
          <p>Order <strong>${order.order_number}</strong> has been confirmed.</p>
          <h3 style="color:#999;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Items</h3>
          <table style="width:100%;border-collapse:collapse;">
            ${order.items
              .map(
                (i) => `
              <tr style="border-bottom:1px solid #222;">
                <td style="padding:8px 0;">${i.product_name}${i.variant_name ? ` — ${i.variant_name}` : ''}</td>
                <td style="padding:8px 0;text-align:right;">×${i.qty}</td>
                <td style="padding:8px 0;text-align:right;color:#ff4500;">${Math.round(i.price_sek * i.qty)} SEK</td>
              </tr>`
              )
              .join('')}
            <tr>
              <td colspan="2" style="padding:12px 0;font-weight:900;">Total</td>
              <td style="padding:12px 0;text-align:right;font-weight:900;color:#ff4500;">${Math.round(order.total)} SEK</td>
            </tr>
          </table>
          ${ticketHtml}
          <p style="margin-top:24px;">
            <a href="${orderUrl}" style="color:#ff4500;">View your order →</a>
          </p>
          <p style="color:#555;font-size:12px;margin-top:32px;">Thank you for supporting Kenny Black.</p>
        </div>
      `,
    })
  } catch (e) {
    console.error('Email send failed:', e)
  }
}
