'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Store YouTube ID globally so BackgroundAudio can access it immediately
let globalYoutubeId: string | null = null
export function getGlobalYoutubeId() {
  return globalYoutubeId
}

export function EnsureYoutubeId() {
  const router = useRouter()

  useEffect(() => {
    // Check if latest song needs YouTube ID and fetch it if needed
    async function ensureYoutubeId() {
      try {
        console.log('EnsureYoutubeId: Checking for YouTube ID...')
        const response = await fetch('/api/musix/ensure-youtube-id')
        const data = await response.json()
        
        console.log('EnsureYoutubeId: Response:', data)
        
        // If we successfully found and updated a YouTube ID, store it globally and refresh
        if (data.success && data.youtubeId) {
          console.log('EnsureYoutubeId: Found YouTube ID:', data.youtubeId)
          globalYoutubeId = data.youtubeId
          
          // Dispatch custom event so BackgroundAudio can listen for it
          window.dispatchEvent(new CustomEvent('youtubeIdFound', { detail: data.youtubeId }))
          
          // Refresh after a delay to ensure database update is complete
          setTimeout(() => {
            router.refresh()
          }, 1500)
        }
      } catch (error) {
        console.error('Failed to ensure YouTube ID:', error)
      }
    }

    ensureYoutubeId()
  }, [router])

  return null
}

