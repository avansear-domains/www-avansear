'use client'

import { useEffect } from 'react'

export function FormRedirect({
  url,
  visitCount,
}: {
  url: string
  visitCount: number | null
}) {
  useEffect(() => {
    window.location.replace(url)
  }, [url])

  return (
    <section className="p-4 -m-4">
      <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter">
        opening form…
        {visitCount != null && (
          <span className="block mt-2 text-sm text-[var(--color-light)]/80">
            opens: {visitCount.toLocaleString()}
          </span>
        )}
      </p>
    </section>
  )
}
