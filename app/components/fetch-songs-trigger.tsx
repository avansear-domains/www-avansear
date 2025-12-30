'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function FetchSongsTrigger() {
  const router = useRouter()

  async function fetchSongs() {
    try {
      const response = await fetch('/api/musix/fetch-songs')
      const data = await response.json()

      if (response.status === 429) {
        // Rate limited - fail silently
        console.warn('Rate limit exceeded:', data.message)
        return
      }

      if (!response.ok || !data.success) {
        // Fail silently - just log to console, don't show popup
        console.error('Failed to fetch songs:', data.message || 'Unknown error', data.error)
        return
      }

      // Ensure latest song has YouTube ID for playback
      try {
        await fetch('/api/musix/ensure-youtube-id')
      } catch (error) {
        // Silently fail - not critical
        console.error('Failed to ensure YouTube ID:', error)
      }
      
      // Refresh the page to show new songs
      router.refresh()
    } catch (error) {
      // Fail silently - just log to console, don't show popup
      console.error('Failed to fetch songs:', error)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  // Component doesn't render anything - it just runs fetchSongs silently in the background
  return null
}

