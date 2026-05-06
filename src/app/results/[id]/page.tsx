'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface JobStatus {
  id: string
  status: 'paid' | 'training' | 'generating' | 'done' | 'failed'
  plan: string
  resultImages: string[]
  error?: string
}

const STATUS = {
  paid: { text: 'Order received — starting your AI model…', pct: 5 },
  training: { text: 'Training your personal AI model…', pct: 35 },
  generating: { text: 'Generating your headshots…', pct: 75 },
  done: { text: 'Your headshots are ready!', pct: 100 },
  failed: { text: 'Something went wrong. Please contact support.', pct: 0 },
}

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<JobStatus | null>(null)
  const [error, setError] = useState('')
  const [selectedImg, setSelectedImg] = useState<string | null>(null)

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/job-status?id=${id}`)
      if (!res.ok) { setError('Order not found.'); return null }
      const data = await res.json()
      setJob(data)
      return data.status
    } catch { setError('Connection error. Please refresh.'); return null }
  }, [id])

  useEffect(() => {
    poll()
    const iv = setInterval(async () => {
      const s = await poll()
      if (s === 'done' || s === 'failed') clearInterval(iv)
    }, 8000)
    return () => clearInterval(iv)
  }, [poll])

  const downloadAll = () => {
    job?.resultImages.forEach((url, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = url; a.download = `facioshots-headshot-${i + 1}.jpg`; a.click()
      }, i * 200)
    })
  }

  const info = job ? STATUS[job.status] : null

  return (
    <main style={{ fontFamily: "'DM Sans',sans-serif", minHeight: '100vh', background: '#FAF8F4', color: '#1A1814' }}>
      <nav style={{ borderBottom: '1px solid rgba(26,24,20,0.1)', padding: '1.25rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.15em', textDecoration: 'none', color: '#1A1814' }}>
          LUM<span style={{ color: '#C9A84C' }}>I</span>O
        </a>
        <span style={{ fontSize: '0.78rem', color: '#8A8278', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Order #{String(id).slice(0, 12)}…</span>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 2rem' }}>
        {error && <div style={{ background: '#FCEBEB', color: '#A32D2D', padding: '1.5rem', marginBottom: '2rem' }}>{error}</div>}

        {job && job.status !== 'done' && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '2.5rem', fontWeight: 300, marginBottom: '1rem' }}>{info?.text}</h1>
            <p style={{ color: '#8A8278', marginBottom: '3rem', fontSize: '0.9rem' }}>
              {job.status !== 'failed' ? "We'll email you when your headshots are ready." : `Email support@facioshots.com with order ID: ${id}`}
            </p>
            {job.status !== 'failed' && (
              <div style={{ maxWidth: 400, margin: '0 auto' }}>
                <div style={{ height: 1, background: 'rgba(26,24,20,0.1)', position: 'relative', marginBottom: '0.75rem' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#C9A84C', width: `${info?.pct}%`, transition: 'width 1s ease' }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: '#8A8278' }}>{info?.pct}% complete</div>
                <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                  {(['paid','training','generating','done'] as const).map(s => {
                    const steps = ['paid','training','generating','done']
                    const done = steps.indexOf(s) <= steps.indexOf(job.status)
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: done ? '#C9A84C' : 'rgba(26,24,20,0.15)' }} />
                        <span style={{ fontSize: '0.82rem', color: done ? '#1A1814' : '#8A8278' }}>
                          {s === 'paid' ? 'Order received' : s === 'training' ? 'Training AI model' : s === 'generating' ? 'Generating headshots' : 'Ready for download'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {job?.status === 'done' && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>Your results</div>
                <h1 style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '2.5rem', fontWeight: 300 }}>{job.resultImages.length} headshots ready</h1>
              </div>
              <button onClick={downloadAll} style={{ background: '#1A1814', color: '#FAF8F4', border: 'none', padding: '0.9rem 2rem', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>Download All</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {job.resultImages.map((url, i) => (
                <div key={i} onClick={() => setSelectedImg(url)} style={{ aspectRatio: '3/4', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Headshot ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  {i === 0 && <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(201,168,76,0.9)', color: '#FAF8F4', fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.6rem' }}>Best match</div>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: '#8A8278', marginTop: '2rem', textAlign: 'center', lineHeight: 1.7 }}>Click any photo to preview · Photos available 30 days · 2048×2048px</p>
          </>
        )}

        {!job && !error && (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontFamily: 'Cormorant Garamond,Georgia,serif', fontSize: '1.8rem', fontWeight: 300 }}>Loading your order…</div>
          </div>
        )}
      </div>

      {selectedImg && (
        <div onClick={() => setSelectedImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,24,20,0.9)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={selectedImg} alt="Preview" style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          <div onClick={() => setSelectedImg(null)} style={{ position: 'absolute', top: '1.5rem', right: '2rem', color: '#FAF8F4', fontSize: '1.5rem', cursor: 'pointer' }}>✕</div>
          <a href={selectedImg} download onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#FAF8F4', color: '#1A1814', padding: '0.75rem 2rem', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>Download</a>
        </div>
      )}
    </main>
  )
}
