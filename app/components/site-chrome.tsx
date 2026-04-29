'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from './nav'
import Footer from './footer'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTravelogue = pathname === '/travelogue'
  const isFeedApp = pathname === '/feed-app' || pathname.startsWith('/feed-app/')

  useEffect(() => {
    document.documentElement.classList.toggle('feedapp-mode', isFeedApp)
    document.body.classList.toggle('travelogue-fullbleed', isTravelogue)
    document.body.classList.toggle('feedapp-fullbleed', isFeedApp)
    return () => {
      document.documentElement.classList.remove('feedapp-mode')
      document.body.classList.remove('travelogue-fullbleed')
      document.body.classList.remove('feedapp-fullbleed')
    }
  }, [isTravelogue, isFeedApp])

  return (
    <main
      className={
        isTravelogue || isFeedApp
          ? 'flex-auto min-h-0 w-full max-w-none flex flex-col !mt-0 !px-0'
          : 'mt-8 flex min-w-0 flex-auto flex-col px-4'
      }
    >
      {!isTravelogue && !isFeedApp && <Navbar />}
      {children}
      {!isTravelogue && !isFeedApp && <Footer />}
    </main>
  )
}
