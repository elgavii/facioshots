import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/db'
import { createFineTune, generateHeadshots, getFineTuneStatus, getPromptStatus } from '@/lib/astria'
import { sendHeadshotsReady } from '@/lib/email'
import { PLANS, PlanKey } from '@/lib/stripe'

// Internal route — protected by secret header
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await req.json()
  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  try {
    // ── Step 1: Fine-tune the model ──────────────────────────────────────
    await updateJob(jobId, { status: 'training' })

    const { tuneId } = await createFineTune(
      job.imageUrls,
      `facioshots-${jobId.slice(0, 8)}`
    )
    await updateJob(jobId, { tuneId })

    // Poll until training is done (max 30 min)
    let trained = false
    for (let i = 0; i < 60; i++) {
      await sleep(30_000) // check every 30s
      const { trained: done } = await getFineTuneStatus(tuneId)
      if (done) { trained = true; break }
    }
    if (!trained) throw new Error('Fine-tune timed out')

    // ── Step 2: Generate headshots ───────────────────────────────────────
    await updateJob(jobId, { status: 'generating' })

    const plan = PLANS[job.plan as PlanKey]
    const count = plan?.headshots || 40

    const { promptId } = await generateHeadshots(tuneId, job.style, job.background, count)
    await updateJob(jobId, { promptId })

    // Poll until images are done (max 20 min)
    let images: string[] = []
    for (let i = 0; i < 40; i++) {
      await sleep(30_000)
      const result = await getPromptStatus(tuneId, promptId)
      if (result.images.length >= count * 0.9) {
        images = result.images
        break
      }
    }
    if (!images.length) throw new Error('Image generation timed out')

    // ── Step 3: Save & notify ────────────────────────────────────────────
    await updateJob(jobId, { status: 'done', resultImages: images })
    await sendHeadshotsReady(job.email, jobId, images)

    return NextResponse.json({ success: true, count: images.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`Job ${jobId} failed:`, message)
    await updateJob(jobId, { status: 'failed', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
