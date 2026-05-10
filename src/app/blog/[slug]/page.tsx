import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { posts, getPost, type Block } from '@/content/blog/posts'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Facioshots Blog`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://facioshots.com/blog/${post.slug}`,
      siteName: 'FACIOSHOTS',
      type: 'article',
      publishedTime: post.date,
    },
  }
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2
          key={i}
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 400,
            lineHeight: 1.2,
            marginTop: '2.5rem',
            marginBottom: '0.875rem',
            color: '#1A1814',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(201,168,76,0.25)',
          }}
        >
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3
          key={i}
          style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '1.3rem',
            fontWeight: 400,
            lineHeight: 1.3,
            marginTop: '1.75rem',
            marginBottom: '0.625rem',
            color: '#1A1814',
          }}
        >
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p
          key={i}
          style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#2C2A26',
            marginBottom: '1.125rem',
            fontWeight: 300,
          }}
        >
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul
          key={i}
          style={{
            margin: '0.5rem 0 1.25rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          {block.items.map((item, j) => (
            <li
              key={j}
              style={{
                fontSize: '0.97rem',
                lineHeight: 1.7,
                color: '#2C2A26',
                fontWeight: 300,
                paddingLeft: '0.25rem',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )
    default:
      return null
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const otherPosts = posts.filter(p => p.slug !== slug).slice(0, 2)

  return (
    <main style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAF8F4', color: '#1A1814', minHeight: '100vh' }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 600px) {
          .post-header { padding: 2.5rem 1.25rem 2rem !important; }
          .post-body { padding: 0 1.25rem 4rem !important; }
          .related-grid { grid-template-columns: 1fr !important; }
        }
        .related-card:hover { box-shadow: 0 6px 24px rgba(26,24,20,0.09); transform: translateY(-2px); }
        .related-card { transition: box-shadow 0.2s, transform 0.2s; }
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

      {/* BREADCRUMB + HEADER */}
      <header className="post-header" style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 2rem 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', letterSpacing: '0.08em', color: '#8A8278', marginBottom: '2rem' }}>
          <Link href="/" style={{ color: '#8A8278', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link href="/blog" style={{ color: '#8A8278', textDecoration: 'none' }}>Blog</Link>
          <span>›</span>
          <span style={{ color: '#1A1814' }}>{post.category}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', fontWeight: 500 }}>
            {post.category}
          </span>
          <span style={{ width: '1px', height: '0.7rem', background: 'rgba(26,24,20,0.2)' }} />
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#8A8278' }}>
            {post.readTime}
          </span>
          <span style={{ width: '1px', height: '0.7rem', background: 'rgba(26,24,20,0.2)' }} />
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', color: '#8A8278' }}>
            {post.dateFormatted}
          </span>
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 300, lineHeight: 1.12, marginBottom: '1.25rem', color: '#1A1814' }}>
          {post.title}
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#8A8278', lineHeight: 1.7, fontWeight: 300, borderLeft: '3px solid #C9A84C', paddingLeft: '1rem' }}>
          {post.excerpt}
        </p>
      </header>

      {/* DIVIDER */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ height: '1px', background: 'linear-gradient(to right, #C9A84C, rgba(201,168,76,0.1))' }} />
      </div>

      {/* ARTICLE BODY */}
      <article className="post-body" style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 2rem 5rem' }}>
        {post.content.map((block, i) => renderBlock(block, i))}

        {/* CTA BLOCK */}
        <div style={{ marginTop: '3rem', background: '#F5F0E8', padding: '2.5rem', borderLeft: '4px solid #C9A84C' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>
            Ready to try it?
          </div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, marginBottom: '0.75rem', color: '#1A1814' }}>
            Get your professional headshots in 20 minutes
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#8A8278', lineHeight: 1.65, marginBottom: '1.5rem', fontWeight: 300 }}>
            Upload 5–20 selfies, choose your style, and receive 40 studio-quality headshots — starting at $14. No photographer, no scheduling, no waiting days for results.
          </p>
          <Link
            href="/#create"
            style={{ display: 'inline-block', background: '#1A1814', color: '#FAF8F4', padding: '0.85rem 1.75rem', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}
          >
            Create My Headshots
          </Link>
        </div>
      </article>

      {/* RELATED POSTS */}
      {otherPosts.length > 0 && (
        <section style={{ background: '#F5F0E8', padding: '3.5rem 2rem' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.75rem' }}>
              Keep reading
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, marginBottom: '2rem', color: '#1A1814' }}>
              More from the blog
            </h2>
            <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {otherPosts.map(related => (
                <Link key={related.slug} href={`/blog/${related.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <article className="related-card" style={{ background: '#FAF8F4', padding: '1.5rem', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.625rem' }}>
                      {related.category}
                    </div>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.3, marginBottom: '0.5rem', color: '#1A1814' }}>
                      {related.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#8A8278', lineHeight: 1.6, fontWeight: 300 }}>
                      {related.readTime} · {related.dateFormatted}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
