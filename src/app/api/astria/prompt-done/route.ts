import { NextRequest, NextResponse } from 'next/server'
import { getJob, updateJob } from '@/lib/db'
import { sendHeadshotsReady } from '@/lib/email'

// Astria POSTs here when image generation completes.
export async function POST(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })

  const body = await req.json()
  const images: string[] = body.prompt?.images?.map((img: { url: string }) => img.url) ?? []
  if (!images.length) {
    console.error('[prompt-done] No images in callback body:', body)
    return NextResponse.json({ error: 'No images in payload' }, { status: 400 })
  }

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  try {
    await updateJob(jobId, { status: 'done', resultImages: images })
    await sendHeadshotsReady(job.email, jobId, images)
    return NextResponse.json({ ok: true, count: images.length })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[prompt-done] Job ${jobId} failed:`, message)
    await updateJob(jobId, { status: 'failed', error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
