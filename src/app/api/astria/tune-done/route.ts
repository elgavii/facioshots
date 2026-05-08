import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/db'
import { generateHeadshots } from '@/lib/astria'
import { PLANS, PlanKey } from '@/lib/stripe'

// Astria POSTs here when fine-tune training completes.
// Kicks off the first batch of 8 images; prompt-done chains subsequent batches.
export async function POST(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const body = await req.json()
  const tuneId: number | undefined = body.tune?.id
  if (!tuneId) {
    console.error('[tune-done] Missing tune.id in callback body:', body)
    return NextResponse.json({ error: 'Invalid callback payload' }, { status: 400 })
  }

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  try {
    await updateJob(jobId, { status: 'generating' })

    const plan = PLANS[job.plan as PlanKey]
    const total = plan?.headshots ?? 40
    const firstBatch = Math.min(8, total)
    const remaining = total - firstBatch

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const callbackUrl =
      `${BASE_URL}/api/astria/prompt-done` +
      `?jobId=${encodeURIComponent(jobId)}` +
      `&remaining=${remaining}` +
      `&target=${total}`

    const { promptId } = await generateHeadshots(
      tuneId,
      job.style,
      job.background,
      job.gender,
      firstBatch,
      callbackUrl
    )
    await updateJob(jobId, { promptId })

    return NextResponse.json({ ok: true, promptId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[tune-done] Job ${jobId} failed:`, message)
    await updateJob(jobId, { status: 'failed', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
