import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface Job {
  id: string
  email: string
  plan: string
  style: string
  background: string
  gender: string
  imageUrls: string[]
  tuneId?: number
  promptId?: number
  status: 'paid' | 'training' | 'generating' | 'done' | 'failed'
  resultImages?: string[]
  createdAt: string
  updatedAt: string
  error?: string
}

export async function createJob(job: Job): Promise<void> {
  await redis.set(`job:${job.id}`, job, { ex: 60 * 60 * 24 * 35 }) // 35 days
}

export async function getJob(id: string): Promise<Job | null> {
  return await redis.get<Job>(`job:${id}`)
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  const job = await getJob(id)
  if (!job) throw new Error(`Job ${id} not found`)
  await redis.set(`job:${id}`, { ...job, ...updates, updatedAt: new Date().toISOString() }, { ex: 60 * 60 * 24 * 35 })
}

// Temporarily store image URLs before checkout (Stripe metadata is capped at 500 chars).
// The webhook retrieves and deletes this record using the pendingId from session metadata.
export async function savePendingImages(pendingId: string, urls: string[]): Promise<void> {
  await redis.set(`pending:${pendingId}`, urls, { ex: 60 * 60 * 24 }) // 24h TTL
}

export async function popPendingImages(pendingId: string): Promise<string[] | null> {
  const urls = await redis.get<string[]>(`pending:${pendingId}`)
  if (urls) await redis.del(`pending:${pendingId}`)
  return urls
}
