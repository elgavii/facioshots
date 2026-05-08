'use client'
import { useState } from 'react'

export default function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email || !message) return
    // In production, wire this to Resend or a form service like Formspree
    setSent(true)
  }

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F4', color: '#1A1814', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid rgba(26,24,20,0.1)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textDecoration: 'none', color: '#1A1814' }}>Facio<span style={{ color: '#C9A84C' }}>shots</span></a>
      </nav>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Get in touch</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '3rem', fontWeight: 300, marginBottom: '0.5rem' }}>Contact us</h1>
        <p style={{ color: '#8A8278', lineHeight: 1.7, marginBottom: '3rem' }}>We respond to all messages within 2 hours during business hours. For order issues, please include your order ID.</p>

        {sent ? (
          <div style={{ background: '#F0F7E8', border: '1px solid #B5D99C', padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.8rem', fontWeight: 300, marginBottom: '0.5rem' }}>Message sent ✦</div>
            <p style={{ color: '#8A8278', fontSize: '0.9rem' }}>We'll get back to you within 2 hours.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', display: 'block', marginBottom: '0.4rem' }}>Your name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid rgba(26,24,20,0.2)', background: 'transparent', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#1A1814' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', display: 'block', marginBottom: '0.4rem' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com"
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid rgba(26,24,20,0.2)', background: 'transparent', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#1A1814' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8A8278', display: 'block', marginBottom: '0.4rem' }}>Message</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us how we can help…" rows={5}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid rgba(26,24,20,0.2)', background: 'transparent', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', color: '#1A1814', resize: 'vertical' }} />
            </div>
            <button onClick={handleSubmit}
              style={{ background: '#1A1814', color: '#FAF8F4', border: 'none', padding: '1rem', fontSize: '0.82rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Send message
            </button>
            <p style={{ fontSize: '0.78rem', color: '#8A8278', textAlign: 'center' }}>Or email us directly at <a href="mailto:support@facioshots.com" style={{ color: '#C9A84C' }}>support@facioshots.com</a></p>
          </div>
        )}
      </div>
    </main>
  )
}
