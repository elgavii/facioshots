'use client'
import { useState, useRef, useCallback } from 'react'

const STYLES = [
  { id: 'corporate', name: 'Corporate', desc: 'Crisp, formal, LinkedIn-ready' },
  { id: 'creative', name: 'Creative', desc: 'Warm, approachable, modern' },
  { id: 'executive', name: 'Executive', desc: 'Authoritative, confident' },
  { id: 'casual', name: 'Casual Pro', desc: 'Friendly, relaxed, startup-style' },
]

const BACKGROUNDS = [
  { id: 'white', color: '#F5F2ED', border: true },
  { id: 'gray', color: '#8A8A8A' },
  { id: 'navy', color: '#1A2744' },
  { id: 'sage', color: '#7A9E8A' },
  { id: 'blush', color: '#D4A89A' },
  { id: 'black', color: '#1A1814' },
]

const PLANS = [
  { id: 'starter', tier: 'Starter', price: '$14', period: 'one-time payment', headshots: 20, features: ['20 AI headshots', '2 style options', '4 background colors', '1080p resolution', '48h delivery'] },
  { id: 'pro', tier: 'Professional', price: '$24', period: 'one-time payment', headshots: 40, featured: true, features: ['40 AI headshots', 'All 4 styles', '6 background colors', '2048px print-ready', '8 minute delivery', 'Retouch included'] },
  { id: 'team', tier: 'Team', price: '$149', period: 'per 10 team members', headshots: 40, features: ['40 headshots per person', 'Consistent brand style', 'Team dashboard', 'Priority processing', 'Dedicated support', 'Custom backgrounds'] },
]

const Logo = () => (
  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em' }}>
    Facio<span style={{ color: '#C9A84C' }}>shots</span>
  </span>
)

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [style, setStyle] = useState('corporate')
  const [background, setBackground] = useState('white')
  const [gender, setGender] = useState('person')
  const [email, setEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 20)
    setUploadedFiles(prev => [...prev, ...arr].slice(0, 20))
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string].slice(0, 20))
      reader.readAsDataURL(f)
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removePhoto = (i: number) => {
    setUploadedFiles(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', 'facioshots')
    const res = await fetch('https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload', { method: 'POST', body: form })
    const data = await res.json()
    return data.secure_url
  }

  const handleSubmit = async () => {
    setError('')
    if (uploadedFiles.length < 5) { setError('Please upload at least 5 photos for best results.'); return }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Please enter a valid email address.'); return }
    setIsLoading(true)
    try {
      const imageUrls = await Promise.all(uploadedFiles.map(uploadToCloudinary))
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, email, style, background, gender, imageUrls }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error || 'Something went wrong. Please try again.')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F4', color: '#1A1814' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; min-height: 90vh; padding-top: 72px; }
        .hero-photos { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; background: #F5F0E8; gap: 2px; }
        .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2rem; margin-top: 3rem; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem; }
        .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
        .nav-links { display: flex; gap: 2rem; }
        .hero-stat-row { display: flex; gap: 2.5rem; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(26,24,20,0.1); }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr; min-height: auto; padding-top: 64px; }
          .hero-photos { min-height: 260px; order: -1; }
          .upload-grid { grid-template-columns: 1fr; gap: 2rem; }
          .steps-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .pricing-grid { grid-template-columns: 1fr; gap: 1rem; }
          .style-grid { grid-template-columns: 1fr 1fr; }
          .nav-links { display: none; }
          .hero-stat-row { gap: 1.5rem; flex-wrap: wrap; }
          .section-pad { padding: 4rem 1.25rem !important; }
          .hero-left { padding: 2rem 1.25rem 3rem !important; }
          .pricing-section { padding: 4rem 1.25rem !important; }
          .footer-inner { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(250,248,244,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(26,24,20,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.5rem' }}>
        <Logo />
        <div className="nav-links" style={{ fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8278' }}>
          <a href="#how" style={{ color: '#8A8278', textDecoration: 'none' }}>How it works</a>
          <a href="#create" style={{ color: '#8A8278', textDecoration: 'none' }}>Create</a>
          <a href="#pricing" style={{ color: '#8A8278', textDecoration: 'none' }}>Pricing</a>
        </div>
        <button onClick={() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ background: '#1A1814', color: '#FAF8F4', border: 'none', padding: '0.6rem 1.2rem', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <section className="hero-grid">
        <div className="hero-left" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 3rem 4rem 2.5rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ display: 'block', width: '1.5rem', height: '1px', background: '#C9A84C' }} />
            AI-Powered Photography
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.6rem, 5vw, 5rem)', fontWeight: 300, lineHeight: 1.08, marginBottom: '1.5rem' }}>
            Your best<br /><em style={{ color: '#C9A84C', fontStyle: 'italic' }}>professional</em><br />portrait, done.
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#8A8278', lineHeight: 1.7, maxWidth: 400, marginBottom: '2rem', fontWeight: 300 }}>
            Upload a few selfies. Our AI renders studio-quality headshots for LinkedIn, resumes, and executive bios — in minutes, not days.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: '#1A1814', color: '#FAF8F4', border: 'none', padding: '0.9rem 1.8rem', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Generate My Headshot
            </button>
            <a href="#how" style={{ border: '1px solid rgba(26,24,20,0.2)', padding: '0.9rem 1.8rem', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1A1814', textDecoration: 'none' }}>
              See how it works
            </a>
          </div>
          <div className="hero-stat-row">
            {[['48k+', 'Headshots created'], ['4.9★', 'Average rating'], ['8 min', 'Avg. delivery']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300 }}>{n}</div>
                <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8278', marginTop: '0.2rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-photos">
          {[
            { bg: 'linear-gradient(160deg,#C8BBA8,#A89880)', label: 'Corporate', span: true },
            { bg: 'linear-gradient(160deg,#8FA89A,#6B8A7A)', label: 'Creative' },
            { bg: 'linear-gradient(160deg,#A0A898,#606858)', label: 'Executive' },
          ].map((p, i) => (
            <div key={i} style={{ background: p.bg, gridColumn: p.span ? '1' : undefined, gridRow: p.span ? '1/3' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, minHeight: 120 }}>
              <svg width="55" height="55" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="28" r="17" fill="rgba(255,255,255,0.28)" />
                <ellipse cx="40" cy="66" rx="27" ry="17" fill="rgba(255,255,255,0.22)" />
              </svg>
              <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>{p.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section-pad" style={{ padding: '5rem 2.5rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>The process</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300 }}>Three steps to your perfect headshot</h2>
        <div className="steps-grid">
          {[
            { n: '01', title: 'Upload your photos', text: 'Select 5–20 casual selfies. Different angles and lighting help the AI learn your features better.' },
            { n: '02', title: 'Choose your style', text: 'Pick from corporate, creative, executive, or casual styles. Select your background and complete checkout.' },
            { n: '03', title: 'Download & share', text: 'Receive 40+ high-resolution headshots within minutes. Download in print-ready quality.' },
          ].map(s => (
            <div key={s.n} style={{ padding: '2rem', border: '1px solid rgba(26,24,20,0.1)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -1, left: -1, width: '2rem', height: 2, background: '#C9A84C' }} />
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '3rem', fontWeight: 300, color: 'rgba(26,24,20,0.07)', lineHeight: 1, marginBottom: '0.75rem' }}>{s.n}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>{s.title}</div>
              <p style={{ fontSize: '0.85rem', color: '#8A8278', lineHeight: 1.7 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREATE */}
      <section id="create" className="section-pad" style={{ padding: '5rem 2.5rem', background: '#F5F0E8' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Create yours</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, marginBottom: '0.5rem' }}>Generate your headshot</h2>
        <p style={{ color: '#8A8278', fontSize: '0.9rem', maxWidth: 480, lineHeight: 1.7, marginBottom: '2.5rem' }}>Upload 5–20 photos, choose your look, complete checkout, and we'll email your headshots when ready.</p>

        <div className="upload-grid">
          {/* Upload */}
          <div>
            <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{ border: `1px dashed ${isDragging ? '#C9A84C' : 'rgba(26,24,20,0.25)'}`, padding: previews.length ? '1rem' : '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(201,168,76,0.04)' : 'transparent', marginBottom: '1rem' }}>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: 'none' }} />
              {previews.length > 0 ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}>
                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={e => { e.stopPropagation(); removePhoto(i) }}
                          style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(26,24,20,0.7)', color: '#FAF8F4', border: 'none', width: 18, height: 18, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    ))}
                    {previews.length < 20 && (
                      <div style={{ aspectRatio: '1', border: '1px dashed rgba(26,24,20,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#8A8278' }}>+</div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#8A8278', marginTop: 8 }}>{previews.length}/20 photos · Click to add more</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📸</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.3rem', fontWeight: 300, marginBottom: '0.5rem' }}>Drop your photos here</div>
                  <p style={{ fontSize: '0.8rem', color: '#8A8278', lineHeight: 1.6, marginBottom: '1.25rem' }}>Upload 5–20 selfies · JPG, PNG, HEIC</p>
                  <span style={{ border: '1px solid #1A1814', padding: '0.5rem 1.2rem', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Choose files</span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#8A8278', lineHeight: 1.6 }}>✦ Best results: clear face, different angles, good lighting<br />✦ Avoid: sunglasses, hats, group photos, heavy filters</p>
          </div>

          {/* Options */}
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 300, marginBottom: '1.25rem' }}>Customize your look</h3>

            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', marginBottom: '0.6rem' }}>Style</div>
            <div className="style-grid">
              {STYLES.map(s => (
                <div key={s.id} onClick={() => setStyle(s.id)}
                  style={{ border: `1px solid ${style === s.id ? '#C9A84C' : 'rgba(26,24,20,0.12)'}`, padding: '0.85rem', cursor: 'pointer', background: style === s.id ? 'rgba(201,168,76,0.05)' : 'transparent', position: 'relative' }}>
                  {style === s.id && <span style={{ position: 'absolute', top: '0.4rem', right: '0.6rem', fontSize: '0.7rem', color: '#C9A84C' }}>✓</span>}
                  <div style={{ fontSize: '0.82rem', fontWeight: 500, marginBottom: '0.2rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.7rem', color: '#8A8278' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', marginBottom: '0.6rem' }}>Subject</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['person', 'man', 'woman'].map(g => (
                <button key={g} onClick={() => setGender(g)}
                  style={{ border: `1px solid ${gender === g ? '#C9A84C' : 'rgba(26,24,20,0.12)'}`, padding: '0.45rem 0.9rem', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', background: gender === g ? 'rgba(201,168,76,0.05)' : 'transparent', color: '#1A1814' }}>
                  {g}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', marginBottom: '0.6rem' }}>Background</div>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {BACKGROUNDS.map(b => (
                <div key={b.id} onClick={() => setBackground(b.id)} title={b.id}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: b.color, cursor: 'pointer', border: background === b.id ? '2px solid #C9A84C' : b.border ? '1px solid #ccc' : '2px solid transparent', transform: background === b.id ? 'scale(1.1)' : 'scale(1)', transition: 'all .2s' }} />
              ))}
            </div>

            <div style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', marginBottom: '0.6rem' }}>Plan</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setSelectedPlan(p.id)}
                  style={{ flex: 1, border: `1px solid ${selectedPlan === p.id ? '#C9A84C' : 'rgba(26,24,20,0.12)'}`, padding: '0.65rem 0.4rem', fontSize: '0.72rem', cursor: 'pointer', background: selectedPlan === p.id ? 'rgba(201,168,76,0.05)' : 'transparent', color: '#1A1814', textAlign: 'center' }}>
                  <div style={{ fontWeight: 500 }}>{p.tier}</div>
                  <div style={{ color: '#C9A84C', fontSize: '0.95rem', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{p.price}</div>
                  <div style={{ color: '#8A8278', fontSize: '0.62rem' }}>{p.headshots} photos</div>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', display: 'block', marginBottom: '0.4rem' }}>Your email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgba(26,24,20,0.2)', background: 'transparent', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#1A1814' }} />
              <p style={{ fontSize: '0.7rem', color: '#8A8278', marginTop: '0.35rem' }}>We'll send your headshots here when ready</p>
            </div>

            {error && <p style={{ background: '#FCEBEB', color: '#A32D2D', padding: '0.75rem 1rem', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}

            <button onClick={handleSubmit} disabled={isLoading}
              style={{ width: '100%', background: isLoading ? '#8A8278' : '#1A1814', color: '#FAF8F4', border: 'none', padding: '1rem', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              {isLoading ? 'Uploading…' : `✦ Continue to Checkout — ${PLANS.find(p => p.id === selectedPlan)?.price}`}
            </button>
            <p style={{ fontSize: '0.7rem', color: '#8A8278', textAlign: 'center', marginTop: '0.65rem', lineHeight: 1.6 }}>Secure payment via Stripe · 30-day money back guarantee</p>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing-section" style={{ padding: '5rem 2.5rem', background: '#1A1814', color: '#FAF8F4' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Simple pricing</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem,4vw,3.2rem)', fontWeight: 300, color: '#FAF8F4' }}>One-time. No subscription.</h2>
        <div className="pricing-grid">
          {PLANS.map(p => (
            <div key={p.id} style={{ border: `1px solid ${p.featured ? '#C9A84C' : 'rgba(255,255,255,0.1)'}`, padding: '2rem', position: 'relative' }}>
              {p.featured && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#1A1814', fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', padding: '0.25rem 0.9rem', whiteSpace: 'nowrap' }}>Most popular</div>}
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem' }}>{p.tier}</div>
              <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.8rem', fontWeight: 300, color: '#FAF8F4', lineHeight: 1, marginBottom: '0.25rem' }}>{p.price}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>{p.period}</div>
              <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: '#C9A84C', fontSize: '0.72rem' }}>—</span>{f}
                  </li>
                ))}
              </ul>
              <button onClick={() => { setSelectedPlan(p.id); document.getElementById('create')?.scrollIntoView({ behavior: 'smooth' }) }}
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.3)', background: p.featured ? '#C9A84C' : 'transparent', color: p.featured ? '#1A1814' : '#FAF8F4' }}>
                Get started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#F5F0E8', padding: '2rem 2.5rem', borderTop: '1px solid rgba(26,24,20,0.1)' }}>
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Logo />
          <span style={{ fontSize: '0.75rem', color: '#8A8278' }}>© 2025 Facioshots. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.75rem', color: '#8A8278', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
