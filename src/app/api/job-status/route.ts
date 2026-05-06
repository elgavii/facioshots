import { NextRequest, NextResponse } from 'next/server'
import { getJob } from '@/lib/db'

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('id')
  if (!jobId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const job = await getJob(jobId)
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Only expose safe fields to the client
  return NextResponse.json({
    id: job.id,
    status: job.status,
    plan: job.plan,
    style: job.style,
    resultImages: job.resultImages || [],
    createdAt: job.createdAt,
    error: job.error,
  })
}
