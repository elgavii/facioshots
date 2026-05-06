import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FACIOSHOTS — AI Professional Headshots',
  description: 'Upload a few selfies. Get 40 studio-quality professional headshots in minutes.',
  openGraph: {
    title: 'FACIOSHOTS — AI Professional Headshots',
    description: 'Studio-quality AI headshots for LinkedIn, resumes & executive bios.',
    url: 'https://facioshots.com',
    siteName: 'FACIOSHOTS',
    images: [{ url: 'https://facioshots.com/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
