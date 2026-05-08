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
  console.log('[prompt-done] raw body:', JSON.stringify(body).slice(0, 500))

  const rawImages: unknown[] = body.prompt?.images ?? []
  const newImages: string[] = rawImages
    .map((img: unknown) => {
      if (typeof img === 'string') return img
      if (img && typeof img === 'object') {
        const o = img as Record<string, unknown>
        return (o.url ?? o.src ?? o.download_url ?? o.path ?? null) as string | null
      }
      return null
    })
    .filter((u): u is string => typeof u === 'string' && u.startsWith('http'))

  console.log('[prompt-done] extracted', newImages.length, 'URLs, first:', newImages[0])

  if (!newImages.length) {
    console.error('[prompt-done] Could not extract image URLs from body:', JSON.stringify(body))
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
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
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
