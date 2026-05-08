const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!
const ASTRIA_BASE = 'https://api.astria.ai'

export interface AstriaJob {
  id: number
  status: 'pending' | 'training' | 'completed' | 'failed'
  tune_id?: number
  images?: string[]
  error?: string
}

export async function createFineTune(
  imageUrls: string[],
  name: string,
  gender: string,
  callbackUrl?: string
): Promise<{ tuneId: number }> {
  const tuneGender = gender === 'woman' ? 'woman' : 'man'

  const formData = new FormData()
  formData.append('tune[title]', name)
  formData.append('tune[name]', tuneGender)
  formData.append('tune[base_tune_id]', '690204') // Realistic Vision v5.1
  if (callbackUrl) formData.append('tune[callback]', callbackUrl)
  imageUrls.forEach((url) => formData.append('tune[image_urls][]', url))

  const res = await fetch(`${ASTRIA_BASE}/tunes`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Astria fine-tune failed: ${err}`)
  }

  const data = await res.json()
  return { tuneId: data.id }
}

// Astria limits num_images to 8 per prompt. For larger counts, callers must
// chain multiple prompts using the sequential callback pattern in prompt-done.
export async function generateHeadshots(
  tuneId: number,
  style: string,
  background: string,
  gender: string,
  count: number = 8,
  callbackUrl?: string
): Promise<{ promptId: number }> {
  const triggerWord = gender === 'woman' ? 'sks woman' : 'sks man'

  const stylePrompts: Record<string, string> = {
    corporate:
      'professional headshot, business attire, crisp white shirt, navy blazer, neutral background, studio lighting, sharp focus, LinkedIn photo, 8k',
    creative:
      'professional headshot, smart casual, warm studio lighting, soft bokeh background, approachable smile, modern creative professional, 8k',
    executive:
      'executive portrait, formal business attire, authoritative, directional studio lighting, dark background, sharp focus, Fortune 500 CEO style, 8k',
    casual:
      'professional headshot, smart casual, relaxed confident pose, natural lighting, startup founder style, approachable, 8k',
  }

  const bgMap: Record<string, string> = {
    white: 'off-white background',
    gray: 'medium gray background',
    navy: 'deep navy blue background',
    sage: 'soft sage green background',
    blush: 'warm blush background',
    black: 'dark black background',
  }

  const styleText = stylePrompts[style] ?? stylePrompts.corporate
  const bgText = bgMap[background] ?? bgMap.white
  const promptText = `${triggerWord}, ${styleText}, ${bgText}`
  const negativePrompt =
    'cartoon, anime, illustration, painting, ugly, deformed, blurry, low quality, watermark, text'

  const batchSize = Math.min(count, 8)

  const promptBody: Record<string, unknown> = {
    text: promptText,
    negative_prompt: negativePrompt,
    num_images: batchSize,
    w: 512,
    h: 768,
    cfg_scale: 7,
    steps: 30,
    seed: -1,
  }
  if (callbackUrl) promptBody.callback = callbackUrl

  const res = await fetch(`${ASTRIA_BASE}/tunes/${tuneId}/prompts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: promptBody }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Astria prompt failed: ${err}`)
  }

  const data = await res.json()
  return { promptId: data.id }
}

export async function getFineTuneStatus(tuneId: number): Promise<{ trained: boolean }> {
  const res = await fetch(`${ASTRIA_BASE}/tunes/${tuneId}`, {
    headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
  })
  if (!res.ok) throw new Error('Failed to get tune status')
  const data = await res.json()
  return { trained: !!data.trained_at }
}

export async function getPromptStatus(
  tuneId: number,
  promptId: number
): Promise<{ status: string; images: string[] }> {
  const res = await fetch(`${ASTRIA_BASE}/tunes/${tuneId}/prompts/${promptId}`, {
    headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
  })
  if (!res.ok) throw new Error('Astria status check failed')
  const data = await res.json()
  return {
    status: data.trained_at ? 'completed' : 'pending',
    images: data.images?.map((img: { url: string }) => img.url) ?? [],
  }
}
