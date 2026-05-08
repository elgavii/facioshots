import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/db'
import { generateHeadshots } from '@/lib/astria'
import { sendHeadshotsReady } from '@/lib/email'

// Astria POSTs here when a prompt (image batch) completes.
// If more images are still needed, queues the next batch (sequential chaining
// avoids race conditions from parallel prompt callbacks writing to the same job).
export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const jobId = searchParams.get('jobId')
  const remaining = parseInt(searchParams.get('remaining') ?? '0')
  const target = parseInt(searchParams.get('target') ?? '40')

  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const body = await req.json()
  const newImages: string[] = body.prompt?.images?.map((img: { url: string }) => img.url) ?? []
  if (!newImages.length) {
    console.error('[prompt-done] No images in callback body:', body)
    return NextResponse.json({ error: 'No images in payload' }, { status: 400 })
  }

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const allImages = [...(job.resultImages ?? []), ...newImages]

  try {
    if (remaining > 0) {
      // Save progress and queue the next batch
      await updateJob(jobId, { resultImages: allImages })

      const nextBatch = Math.min(8, remaining)
      const nextRemaining = remaining - nextBatch
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!
      const callbackUrl =
        `${BASE_URL}/api/astria/prompt-done` +
        `?jobId=${encodeURIComponent(jobId)}` +
        `&remaining=${nextRemaining}` +
        `&target=${target}`

      const { promptId } = await generateHeadshots(
        job.tuneId!,
        job.style,
        job.background,
        job.gender,
        nextBatch,
        callbackUrl
      )
      await updateJob(jobId, { promptId })

      return NextResponse.json({ ok: true, collected: allImages.length, remaining: nextRemaining })
    } else {
      // All batches complete
      await updateJob(jobId, { status: 'done', resultImages: allImages })
      await sendHeadshotsReady(job.email, jobId, allImages)
      return NextResponse.json({ ok: true, count: allImages.length })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[prompt-done] Job ${jobId} failed:`, message)
    await updateJob(jobId, { status: 'failed', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
