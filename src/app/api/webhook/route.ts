import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createJob, popPendingImages } from '@/lib/db'
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

    const imageUrls = await popPendingImages(meta.pendingId)
    if (!imageUrls) {
      console.error('[webhook] No pending images found for pendingId:', meta.pendingId)
      return NextResponse.json({ error: 'Images not found' }, { status: 500 })
    }

    const job = {
      id: session.id,
      email: session.customer_email || meta.email,
      plan: meta.plan,
      style: meta.style,
      background: meta.background,
      gender: meta.gender,
      imageUrls,
      status: 'paid' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save job to DB — if this throws, return 500 so Stripe retries the webhook
    try {
      await createJob(job)
    } catch (err) {
      console.error('[webhook] Redis createJob failed:', err)
      return NextResponse.json({ error: 'DB write failed' }, { status: 500 })
    }

    // Send confirmation email — non-critical, don't fail the webhook if it errors
    sendOrderConfirmation(job.email, session.id, meta.plan).catch((err) =>
      console.error('[webhook] Order confirmation email failed:', err)
    )

    // Kick off AI generation (async — don't await)
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
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
