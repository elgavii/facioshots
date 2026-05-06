import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanKey } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { plan, email, style, background, gender, imageUrls } = await req.json()

    if (!plan || !email || !imageUrls?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const selectedPlan = PLANS[plan as PlanKey]
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: selectedPlan.price,
            product_data: {
              name: `FACIOSHOTS ${selectedPlan.name} — ${selectedPlan.headshots} AI Headshots`,
              description: `Professional AI-generated headshots in ${style} style`,
              images: ['https://facioshots.com/og-image.png'], // update with your actual image
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        plan,
        style,
        background,
        gender,
        imageUrls: JSON.stringify(imageUrls),
        email,
      },
      success_url: `${BASE_URL}/results/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?canceled=true`,
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
