import { Redis } from '@upstash/redis'

// fromEnv() reads UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN and throws
// at construction time (not silently at first use) when vars are missing.
const redis = Redis.fromEnv()

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
