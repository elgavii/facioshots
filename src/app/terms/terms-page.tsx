export default function Terms() {
  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F4', color: '#1A1814', minHeight: '100vh' }}>
      <nav style={{ borderBottom: '1px solid rgba(26,24,20,0.1)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textDecoration: 'none', color: '#1A1814' }}>Facio<span style={{ color: '#C9A84C' }}>shots</span></a>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>Legal</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '3rem', fontWeight: 300, marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: '#8A8278', fontSize: '0.85rem', marginBottom: '3rem' }}>Last updated: May 2025</p>

        {[
          { title: '1. Service Description', body: 'Facioshots provides AI-generated professional headshot images based on photos uploaded by the user. By using our service, you agree to these terms in full.' },
          { title: '2. Payment & Refunds', body: 'All payments are one-time and non-refundable once AI generation has begun. If your headshots fail to generate due to a technical error on our end, we will re-process your order or issue a full refund at our discretion. Refund requests must be made within 30 days of purchase.' },
          { title: '3. Your Photos', body: 'You retain full ownership of the photos you upload. By uploading, you grant Facioshots a limited license to process your images solely for the purpose of generating your headshots. We do not sell, share, or use your photos for any other purpose. Uploaded photos are deleted from our servers within 35 days.' },
          { title: '4. Generated Images', body: 'You own the AI-generated headshots delivered to you and may use them for any personal or commercial purpose, including LinkedIn profiles, resumes, websites, and marketing materials.' },
          { title: '5. Acceptable Use', body: 'You must be 18 years or older to use this service. You may not upload photos of other people without their explicit consent. You may not use our service to generate images intended to deceive, impersonate, or harm others.' },
          { title: '6. Quality Disclaimer', body: 'AI-generated images may not perfectly represent your likeness in all cases. Results vary based on the quality and quantity of photos provided. We recommend uploading at least 10 clear, well-lit photos for best results.' },
          { title: '7. Limitation of Liability', body: 'Facioshots is not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service.' },
          { title: '8. Changes to Terms', body: 'We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.' },
          { title: '9. Contact', body: 'For questions about these terms, email us at support@facioshots.com.' },
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
