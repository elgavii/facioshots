import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createJob } from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/email'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
const session = event.data.object as Stripe.Checkout.Session
  const meta = session.metadata!

    const job = {
      id: session.id,
      email: session.customer_email || meta.email,
      plan: meta.plan,
      style: meta.style,
      background: meta.background,
      gender: meta.gender,
      imageUrls: JSON.parse(meta.imageUrls || '[]'),
      status: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save job to DB
    await createJob(job)

    // Send confirmation email
    await sendOrderConfirmation(job.email, session.id, meta.plan)

    // Kick off AI generation (async — don't await)
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    fetch(`${BASE_URL}/api/generate-headshots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
      },
      body: JSON.stringify({ jobId: session.id }),
    }).catch(console.error)
  }

  return NextResponse.json({ received: true })
}
