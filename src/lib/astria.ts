/**
 * Astria AI integration
 * Docs: https://docs.astria.ai
 */

const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY!
const ASTRIA_BASE = 'https://api.astria.ai'

export interface AstriaJob {
  id: number
  status: 'pending' | 'training' | 'completed' | 'failed'
  tune_id?: number
  images?: string[]
  error?: string
}

// Step 1: Create a fine-tune (trains the model on uploaded photos)
export async function createFineTune(
  imageUrls: string[],
  name: string
): Promise<{ tuneId: number }> {
  const formData = new FormData()
  formData.append('tune[title]', name)
  formData.append('tune[name]', 'man') // or 'woman' — set dynamically based on user input
  formData.append('tune[base_tune_id]', '690204') // Realistic Vision v5.1

  // Attach each image URL
  imageUrls.forEach((url) => {
    formData.append('tune[image_urls][]', url)
  })

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

// Step 2: Queue prompts to generate headshot variations
export async function generateHeadshots(
  tuneId: number,
  style: string,
  background: string,
  count: number = 40
): Promise<{ promptId: number }> {
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

  const prompt = `${stylePrompts[style] || stylePrompts.corporate}, ${bgMap[background] || bgMap.white}, (ohwx person)`
  const negativePrompt =
    'cartoon, anime, illustration, painting, ugly, deformed, blurry, low quality, watermark, text'

  const res = await fetch(`${ASTRIA_BASE}/tunes/${tuneId}/prompts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ASTRIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: {
        text: prompt,
        negative_prompt: negativePrompt,
        num_images: count,
        w: 512,
        h: 768,
        cfg_scale: 7,
        steps: 30,
        seed: -1,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Astria prompt failed: ${err}`)
  }

  const data = await res.json()
  return { promptId: data.id }
}

// Step 3: Poll for completion
export async function getPromptStatus(
  tuneId: number,
  promptId: number
): Promise<{ status: string; images: string[] }> {
  const res = await fetch(`${ASTRIA_BASE}/tunes/${tuneId}/prompts/${promptId}`, {
    headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
  })

  if (!res.ok) throw new Error(`Astria status check failed`)

  const data = await res.json()
  return {
    status: data.trained_at ? 'completed' : 'pending',
    images: data.images?.map((img: { url: string }) => img.url) || [],
  }
}

// Check fine-tune training status
export async function getFineTuneStatus(tuneId: number): Promise<{ trained: boolean }> {
  const res = await fetch(`${ASTRIA_BASE}/tunes/${tuneId}`, {
    headers: { Authorization: `Bearer ${ASTRIA_API_KEY}` },
  })
  if (!res.ok) throw new Error('Failed to get tune status')
  const data = await res.json()
  return { trained: !!data.trained_at }
}
