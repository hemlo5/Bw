import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Boards Wallah - CBSE Board Exam Papers 2026',
  description: 'Get CBSE Class 10 and Class 12 Board Exam Papers 2026, Answer Keys, Analysis, and Study Materials. Download previous year question papers and important questions.',
  keywords: 'Board Exam 2026, Board Paper 2026, CBSE, Class 10, Class 12, Question Papers, Answer Keys',
  authors: [{ name: 'Boards Wallah' }],
  creator: 'Boards Wallah',
  publisher: 'Boards Wallah',
  robots: 'index, follow',
  openGraph: {
    title: 'Boards Wallah - CBSE Board Exam Papers 2026',
    description: 'Get CBSE Class 10 and Class 12 Board Exam Papers 2026, Answer Keys, Analysis, and Study Materials.',
    url: 'https://boardswallah.com',
    siteName: 'Boards Wallah',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boards Wallah - CBSE Board Exam Papers 2026',
    description: 'Get CBSE Class 10 and Class 12 Board Exam Papers 2026',
  },
  alternates: {
    canonical: 'https://boardswallah.com',
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  // NOTE: Add your real Google Search Console verification token here:
  // verification: { google: 'YOUR_SEARCH_CONSOLE_TOKEN' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3824693248848543" crossOrigin="anonymous"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9XPGPFXN4L"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9XPGPFXN4L');
          `
        }} />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
