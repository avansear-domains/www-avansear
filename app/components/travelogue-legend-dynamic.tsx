'use client'

import { useEffect, useState } from 'react'
import { TravelogueLegend } from './travelogue-legend'

type MarkerRow = { marker_type?: string }

function countByType(markers: MarkerRow[]) {
  let visited = 0
  let wishes = 0
  for (const m of markers) {
    if (m.marker_type === 'wishes') wishes += 1
    else visited += 1
  }
  return { visited, wishes }
}

/**
 * Loads marker totals from the same API the map uses so counts stay in sync with live data
 * (not build-time / static route cache).
 */
export function TravelogueLegendDynamic() {
  const [visitedCount, setVisitedCount] = useState<number | null>(null)
  const [wishesCount, setWishesCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/travelogue/markers', { cache: 'no-store' })
        if (!res.ok || cancelled) return
        const data: unknown = await res.json()
        if (!Array.isArray(data) || cancelled) return
        const { visited, wishes } = countByType(data as MarkerRow[])
        if (!cancelled) {
          setVisitedCount(visited)
          setWishesCount(wishes)
        }
      } catch {
        if (!cancelled) {
          setVisitedCount(0)
          setWishesCount(0)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return <TravelogueLegend visitedCount={visitedCount} wishesCount={wishesCount} />
}
