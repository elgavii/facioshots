import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/content/blog/posts'

export const metadata: Metadata = {
  title: 'Blog — Facioshots | AI Headshot Tips & Career Guides',
  description:
    'Expert guides on AI headshots, LinkedIn profile tips, and professional photography advice from the Facioshots team.',
  openGraph: {
    title: 'Blog — Facioshots | AI Headshot Tips & Career Guides',
    description:
      'Expert guides on AI headshots, LinkedIn profile tips, and professional photography advice from the Facioshots team.',
    url: 'https://facioshots.com/blog',
    siteName: 'FACIOSHOTS',
    type: 'website',
  },
}

export default function BlogIndex() {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F4', color: '#1A1814', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .blog-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
        @media (max-width: 900px) { .blog-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .blog-grid { grid-template-columns: 1fr; gap: 1rem; } .hero-pad { padding: 3rem 1.25rem 2rem !important; } }
        .post-card:hover { box-shadow: 0 8px 32px rgba(26,24,20,0.10); transform: translateY(-2px); }
        .post-card { transition: box-shadow 0.2s, transform 0.2s; }
        .read-more:hover { color: #1A1814 !important; }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid rgba(26,24,20,0.1)', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(250,248,244,0.95)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
        <Link href="/" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.08em', textDecoration: 'none', color: '#1A1814' }}>
          Facio<span style={{ color: '#C9A84C' }}>shots</span>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8278' }}>
          <Link href="/#how" style={{ color: '#8A8278', textDecoration: 'none' }}>How it works</Link>
          <Link href="/#pricing" style={{ color: '#8A8278', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/blog" style={{ color: '#C9A84C', textDecoration: 'none' }}>Blog</Link>
        </div>
        <Link href="/#create" style={{ background: '#1A1814', color: '#FAF8F4', padding: '0.6rem 1.2rem', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Get Started
        </Link>
      </nav>

      {/* HEADER */}
      <section className="hero-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem 2rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ display: 'block', width: '1.5rem', height: '1px', background: '#C9A84C' }} />
          Guides &amp; Insights
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 300, lineHeight: 1.1, marginBottom: '1rem' }}>
          The Facioshots Blog
        </h1>
        <p style={{ color: '#8A8278', fontSize: '1rem', lineHeight: 1.7, maxWidth: 520, fontWeight: 300 }}>
          Practical guides on AI headshots, LinkedIn profile strategy, and everything you need to put your best face forward professionally.
        </p>
      </section>

      {/* POSTS GRID */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem 6rem' }}>
        <div className="blog-grid">
          {sorted.map((post, i) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article
                className="post-card"
                style={{
                  background: '#F5F0E8',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  cursor: 'pointer',
                  ...(i === 0 ? { borderTop: '3px solid #C9A84C' } : { borderTop: '3px solid transparent' }),
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>
                    {post.category}
                  </span>
                  <span style={{ width: '1px', height: '0.7rem', background: 'rgba(26,24,20,0.15)' }} />
                  <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#8A8278' }}>
                    {post.readTime}
                  </span>
                </div>

                <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.45rem', fontWeight: 400, lineHeight: 1.25, marginBottom: '1rem', color: '#1A1814' }}>
                  {post.title}
                </h2>

                <p style={{ fontSize: '0.875rem', color: '#8A8278', lineHeight: 1.65, marginBottom: '1.5rem', fontWeight: 300, flexGrow: 1 }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(26,24,20,0.1)' }}>
                  <span style={{ fontSize: '0.72rem', color: '#8A8278', letterSpacing: '0.05em' }}>
                    {post.dateFormatted}
                  </span>
                  <span className="read-more" style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', transition: 'color 0.15s' }}>
                    Read →
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(26,24,20,0.1)', padding: '2rem', background: '#FAF8F4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.08em' }}>
            Facio<span style={{ color: '#C9A84C' }}>shots</span>
          </span>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8A8278' }}>
            <Link href="/privacy" style={{ color: '#8A8278', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#8A8278', textDecoration: 'none' }}>Terms</Link>
            <Link href="/contact" style={{ color: '#8A8278', textDecoration: 'none' }}>Contact</Link>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#8A8278' }}>© 2026 Facioshots</span>
        </div>
      </footer>
    </main>
  )
}
