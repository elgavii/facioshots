import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/db'
import { createFineTune } from '@/lib/astria'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { jobId } = await req.json()
  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  try {
    await updateJob(jobId, { status: 'training' })

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const callbackUrl = `${BASE_URL}/api/astria/tune-done?jobId=${encodeURIComponent(jobId)}`

    const { tuneId } = await createFineTune(
      job.imageUrls,
      `facioshots-${jobId.slice(0, 8)}`,
      job.gender,
      callbackUrl
    )
    await updateJob(jobId, { tuneId })

    // Fine-tune is now queued on Astria. When training completes, Astria will
    // POST to /api/astria/tune-done which kicks off image generation.
    return NextResponse.json({ ok: true, tuneId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[generate-headshots] Job ${jobId} failed:`, message)
    await updateJob(jobId, { status: 'failed', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
