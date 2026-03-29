'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Navbar } from './nav'
import Footer from './footer'

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isTravelogue = pathname === '/travelogue'

  useEffect(() => {
    document.body.classList.toggle('travelogue-fullbleed', isTravelogue)
    return () => document.body.classList.remove('travelogue-fullbleed')
  }, [isTravelogue])

  return (
    <main
      className={
        isTravelogue
          ? 'flex-auto min-h-0 w-full max-w-none flex flex-col !mt-0 !px-0'
          : 'mt-8 flex min-w-0 flex-auto flex-col px-4'
      }
    >
      {!isTravelogue && <Navbar />}
      {children}
      {!isTravelogue && <Footer />}
    </main>
  )
}
