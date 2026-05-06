# FACIOSHOTS — Full Setup Guide

## What's built
- **Next.js 14** app (App Router)
- **Stripe** — checkout + webhooks for payment
- **Astria AI** — fine-tunes a model on user photos, generates 40 headshots
- **Resend** — transactional emails (order confirmed + headshots ready)
- **Cloudinary** — stores uploaded user photos
- **Vercel** — one-click deployment

---

## Step 1 — Accounts to create (all free to start)

| Service | URL | What for |
|---------|-----|----------|
| Stripe | stripe.com | Payments |
| Astria | astria.ai | AI generation |
| Resend | resend.com | Emails |
| Cloudinary | cloudinary.com | Photo storage |
| Vercel | vercel.com | Hosting |
| GitHub | github.com | Code repo |

---

## Step 2 — Stripe setup

1. Go to **stripe.com** → create account
2. Dashboard → **Products** → Add product for each plan:
   - "FACIOSHOTS Starter" — $14 one-time
   - "FACIOSHOTS Professional" — $24 one-time  
   - "FACIOSHOTS Team" — $149 one-time
3. Copy each **Price ID** (starts with `price_`)
4. Get your **API keys** from Developers → API Keys
5. You'll add the webhook secret in Step 6

---

## Step 3 — Astria setup

1. Go to **astria.ai** → Sign up
2. Profile → API Key → copy it (starts with `sd_`)
3. No other setup needed — the app handles everything

---

## Step 4 — Resend setup

1. Go to **resend.com** → Sign up
2. Add & verify your domain (e.g. facioshots.com)
3. Create an API key → copy it
4. Update `EMAIL_FROM` in `.env.local` to use your verified domain

---

## Step 5 — Cloudinary setup

1. Go to **cloudinary.com** → free account
2. Dashboard → Settings → Upload → **Add upload preset**
   - Preset name: `facioshots`
   - Signing mode: **Unsigned**
   - Save
3. Copy your **Cloud Name** from the dashboard
4. In `src/app/page.tsx`, find this line and update it:
   ```
   const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload'
   ```
   Replace `YOUR_CLOUD_NAME` with your actual cloud name.

---

## Step 6 — Deploy to Vercel

### 6a — Push to GitHub
```bash
cd facioshots
git init
git add .
git commit -m "Initial commit"
gh repo create facioshots --public --push
```

### 6b — Import to Vercel
1. Go to **vercel.com** → New Project → Import your repo
2. Framework: **Next.js** (auto-detected)
3. Add all environment variables (see `.env.example`):

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...       ← add this in step 6c
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...
ASTRIA_API_KEY=sd_...
RESEND_API_KEY=re_...
EMAIL_FROM=headshots@yourdomain.com
NEXT_PUBLIC_BASE_URL=https://your-vercel-url.vercel.app
INTERNAL_API_SECRET=<run: openssl rand -hex 32>
```

4. Click **Deploy**

### 6c — Set up Stripe webhook
After deploying:
1. Stripe Dashboard → Developers → **Webhooks** → Add endpoint
2. URL: `https://your-vercel-url.vercel.app/api/webhook`
3. Events to listen for: `checkout.session.completed`
4. Copy the **Signing secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel
5. Redeploy (Vercel → your project → Redeploy)

---

## Step 7 — Test the full flow

1. Go to your Vercel URL
2. Upload 5+ photos, fill in email, click Continue to Checkout
3. Use Stripe test card: `4242 4242 4242 4242` (any future date, any CVC)
4. Check that you receive the confirmation email
5. Watch the results page poll for status updates
6. (With real Astria credits) headshots generate in ~15 min and email arrives

---

## Production checklist

- [ ] Switch Stripe to **live mode** (use `sk_live_` keys)
- [ ] Add a real domain to Vercel
- [ ] Set `NEXT_PUBLIC_BASE_URL` to your real domain
- [ ] Verify your email domain in Resend
- [ ] Replace file-based DB (`src/lib/db.ts`) with **Vercel KV** or **Upstash Redis** for production
- [ ] Add `og-image.png` to `/public/`
- [ ] Set up Stripe → enable Apple Pay / Google Pay for higher conversion

---

## Revenue math

| Metric | Value |
|--------|-------|
| Avg. order value | ~$22 (mostly Pro plan) |
| Orders needed for $5k/day | ~227/day |
| Conversion rate (typical) | 2–3% |
| Traffic needed | ~9,000 visitors/day |

**Acquisition channels that work for this:**
- TikTok / Instagram Reels — "LinkedIn glow-up" content goes viral
- Reddit — r/jobs, r/careerguidance, r/LinkedIn
- SEO — "AI headshot generator", "professional headshot from selfie"
- ProductHunt launch
- Affiliate program — 20% commission for referrals

---

## Swap file DB for Vercel KV (recommended for production)

```bash
npm install @vercel/kv
```

Then replace `src/lib/db.ts` with:

```typescript
import { kv } from '@vercel/kv'
import type { Job } from './db'

export async function createJob(job: Job) {
  await kv.set(`job:${job.id}`, job, { ex: 60 * 60 * 24 * 35 }) // 35 days
}

export async function getJob(id: string): Promise<Job | null> {
  return await kv.get(`job:${id}`)
}

export async function updateJob(id: string, updates: Partial<Job>) {
  const job = await getJob(id)
  if (!job) throw new Error(`Job ${id} not found`)
  await kv.set(`job:${id}`, { ...job, ...updates, updatedAt: new Date().toISOString() }, { ex: 60 * 60 * 24 * 35 })
}
```

Add `KV_REST_API_URL` and `KV_REST_API_TOKEN` to Vercel env vars (auto-added when you provision Vercel KV).

---

## Support

Questions? The key files to understand:

| File | What it does |
|------|-------------|
| `src/app/page.tsx` | Landing page + upload + checkout flow |
| `src/app/results/[id]/page.tsx` | Order status + download page |
| `src/app/api/create-checkout/route.ts` | Creates Stripe session |
| `src/app/api/webhook/route.ts` | Handles payment confirmation |
| `src/app/api/generate-headshots/route.ts` | Runs Astria AI pipeline |
| `src/app/api/job-status/route.ts` | Polls job status for frontend |
| `src/lib/astria.ts` | All Astria API calls |
| `src/lib/email.ts` | Email templates |
| `src/lib/db.ts` | Job storage (swap for KV in prod) |
