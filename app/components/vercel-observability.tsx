import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

/**
 * Only injects Vercel Analytics / Speed Insights when running on Vercel (`VERCEL=1` at build time).
 * Avoids failed requests in local `next dev`. Set `NEXT_PUBLIC_DISABLE_VERCEL_INSIGHTS=1` to skip
 * entirely (e.g. if you do not use Analytics in the Vercel dashboard).
 *
 * Browsers with strict blockers may still log ERR_BLOCKED_BY_CLIENT for `/_vercel/*` scripts;
 * that is expected and does not break the site.
 */
export function VercelObservability() {
  if (process.env.NEXT_PUBLIC_DISABLE_VERCEL_INSIGHTS === '1') {
    return null
  }
  if (process.env.VERCEL !== '1') {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
