import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { CartItem } from '@/types/database'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  try {
    const { items }: { items: CartItem[] } = await req.json()

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const line_items = items.map((item) => ({
      price_data: {
        currency: 'sek',
        product_data: {
          name: item.product.name + (item.variant_name ? ` — ${item.variant_name}` : ''),
          ...(item.product.images?.[0] ? { images: [item.product.images[0]] } : {}),
          metadata: {
            product_id: item.product.id,
            variant_id: item.variant_id || '',
            type: item.product.type,
            fulfillment: item.product.fulfillment,
          },
        },
        unit_amount: Math.round(item.unit_price * 100), // öre
      },
      quantity: item.qty,
    }))

    // Serialize cart for webhook (metadata has 500 char limit per key, use compact form)
    const cartPayload = items.map((i) => ({
      pid: i.product.id,
      pname: i.product.name,
      vid: i.variant_id || '',
      vname: i.variant_name || '',
      qty: i.qty,
      price: i.unit_price,
      type: i.product.type,
      ful: i.product.fulfillment,
    }))

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['SE', 'NO', 'DK', 'FI', 'DE', 'GB', 'US', 'NL', 'FR', 'ES'],
      },
      success_url: `${siteUrl}/shop/order/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/shop`,
      metadata: {
        cart: JSON.stringify(cartPayload).slice(0, 500),
        cart2: JSON.stringify(cartPayload).length > 500
          ? JSON.stringify(cartPayload).slice(500, 1000)
          : '',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
