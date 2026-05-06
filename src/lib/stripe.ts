import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 1400, // cents
    headshots: 20,
    priceId: process.env.STRIPE_PRICE_STARTER!,
  },
  pro: {
    name: 'Professional',
    price: 2400,
    headshots: 40,
    priceId: process.env.STRIPE_PRICE_PRO!,
  },
  team: {
    name: 'Team',
    price: 14900,
    headshots: 40,
    priceId: process.env.STRIPE_PRICE_TEAM!,
  },
} as const

export type PlanKey = keyof typeof PLANS
