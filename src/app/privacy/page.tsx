export default function Privacy() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F4', color: '#1A1814', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid rgba(26,24,20,0.1)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textDecoration: 'none', color: '#1A1814' }}>Facio<span style={{ color: '#C9A84C' }}>shots</span></a>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Legal</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '3rem', fontWeight: 300, marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: '#8A8278', fontSize: '0.85rem', marginBottom: '3rem' }}>Last updated: May 2025</p>
        {[
          { title: 'What we collect', body: 'We collect your email address, uploaded photos, and payment information (processed securely by Stripe — we never see your full card details). We also collect basic usage data to improve the service.' },
          { title: 'How we use your data', body: 'Your email is used to send order confirmations and deliver your headshots. Your photos are used solely to generate your AI headshots and are deleted within 35 days. We never sell your data to third parties.' },
          { title: 'Third-party services', body: 'We use Stripe for payment processing, Astria for AI generation, Resend for email delivery, and Cloudinary for temporary photo storage. Each has their own privacy policy.' },
          { title: 'Data retention', body: 'Your email is retained for up to 2 years for customer support purposes. Uploaded photos and generated headshots are deleted within 35 days of your order.' },
          { title: 'Your rights', body: 'You may request deletion of your data at any time by emailing support@facioshots.com. We will process your request within 30 days.' },
          { title: 'Cookies', body: 'We use minimal cookies necessary for the site to function. We do not use tracking or advertising cookies.' },
          { title: 'Contact', body: 'For privacy concerns, contact us at support@facioshots.com.' },
        ].map(s => (
          <div key={s.title} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(26,24,20,0.08)' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 400, marginBottom: '0.75rem' }}>{s.title}</h2>
            <p style={{ color: '#4A4540', lineHeight: 1.8, fontSize: '0.9rem' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
