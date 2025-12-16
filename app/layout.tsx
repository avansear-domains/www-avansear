import '../styles/globals.css'
import '../styles/components.css'
import '../styles/variables.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Navbar } from './components/nav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Footer from './components/footer'
import { CustomCursor } from './components/custom-cursor'
import { CursorProvider } from './components/cursor-context'
import { CursorHint } from './components/cursor-hint'
import { baseUrl } from './sitemap'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: 'avan',
  description: 'say hi :)',
  icons: {
    icon: [
      { url: '/favi.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favi.png',
    apple: '/favi.png',
  },
  openGraph: {
    title: 'i\'m avan',
    description: 'high functioning insmoniac. 20 y/o weirdo who does things based on instincts and intuition.',
    url: baseUrl,
    siteName: 'avan\'s portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og?title=${encodeURIComponent('i\'m avan')}&v=2`,
        width: 1200,
        height: 630,
        alt: 'avan\'s portfolio',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

const cx = (...classes) => classes.filter(Boolean).join(' ')

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-[var(--color-dark)] bg-[var(--color-light)] dark:text-[var(--color-light)] dark:bg-[var(--color-dark)]',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <head>
        <link rel="icon" href="/favi.png" type="image/png" />
        <link rel="shortcut icon" href="/favi.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favi.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="avan's blog"
          href="/rss"
        />
        {process.env.RYBBIT_SITE_ID && (
          <script
            src="https://app.rybbit.io/api/script.js"
            data-site-id={process.env.RYBBIT_SITE_ID}
            defer
          />
        )}
      </head>
      <body className="antialiased max-w-xl mx-4 mt-8 sm:mx-auto">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function getCookie(name) {
                    if (typeof document === 'undefined') return null;
                    const nameEQ = name + '=';
                    const ca = document.cookie.split(';');
                    for (let i = 0; i < ca.length; i++) {
                      let c = ca[i];
                      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
                    }
                    return null;
                  }
                  
                  const storedTheme = getCookie('selectedTheme');
                  if (storedTheme && document.documentElement) {
                    document.documentElement.setAttribute('data-theme', storedTheme);
                  }
                } catch (e) {
                  // Ignore errors in case of CSP or other restrictions
                }
              })();
            `,
          }}
        />
        <CursorProvider>
          <CustomCursor />
          <CursorHint />
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Footer />
            <Analytics />
            <SpeedInsights />
          </main>
        </CursorProvider>
      </body>
    </html>
  )
}
