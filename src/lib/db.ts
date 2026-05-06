/**
 * Lightweight file-based job store.
 * In production, swap this for Vercel KV, Upstash Redis, or Planetscale.
 * 
 * To use Vercel KV instead:
 *   npm install @vercel/kv
 *   Replace all functions below with @vercel/kv calls (same interface).
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

const DB_PATH = path.join(os.tmpdir(), 'facioshots-jobs.json')

export interface Job {
  id: string                // Stripe session ID (serves as order ID)
  email: string
  plan: string
  style: string
  background: string
  gender: string
  imageUrls: string[]       // uploaded photo URLs
  tuneId?: number           // Astria fine-tune ID
  promptId?: number         // Astria prompt ID
  status: 'paid' | 'training' | 'generating' | 'done' | 'failed'
  resultImages?: string[]   // final headshot URLs
  createdAt: string
  updatedAt: string
  error?: string
}

async function readDB(): Promise<Record<string, Job>> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeDB(data: Record<string, Job>): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
}

export async function createJob(job: Job): Promise<void> {
  const db = await readDB()
  db[job.id] = job
  await writeDB(db)
}

export async function getJob(id: string): Promise<Job | null> {
  const db = await readDB()
  return db[id] || null
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  const db = await readDB()
  if (!db[id]) throw new Error(`Job ${id} not found`)
  db[id] = { ...db[id], ...updates, updatedAt: new Date().toISOString() }
  await writeDB(db)
}
