'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function FetchSongsTrigger() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate-limited'>('idle')
  const [message, setMessage] = useState<string>('')
  const router = useRouter()

  async function fetchSongs() {
    try {
      setStatus('loading')
      setMessage('Fetching songs from playlist...')
      const response = await fetch('/api/musix/fetch-songs')
      const data = await response.json()

      if (response.status === 429) {
        setStatus('rate-limited')
        setMessage(data.message || 'Rate limit exceeded')
        return
      }

      if (!response.ok || !data.success) {
        setStatus('error')
        setMessage(data.message || 'Failed to fetch songs')
        return
      }

      setStatus('success')
      setMessage(data.message || 'Songs updated successfully')
      
      // Ensure latest song has YouTube ID for playback
      try {
        await fetch('/api/musix/ensure-youtube-id')
      } catch (error) {
        // Silently fail - not critical
        console.error('Failed to ensure YouTube ID:', error)
      }
      
      // Refresh the page to show new songs
      router.refresh()
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to fetch songs')
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  if (status === 'idle' && !message) {
    return null
  }

  return (
    <div className="mb-4 p-3 rounded-lg border text-sm">
      {status === 'loading' && (
        <div className="flex items-center gap-2">
          <span className="animate-spin">⏳</span>
          <span>{message}</span>
        </div>
      )}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <span>✓</span>
          <span>{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <span>✗</span>
          <span>{message}</span>
          <button
            onClick={fetchSongs}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
      {status === 'rate-limited' && (
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <span>⚠</span>
          <span>{message}</span>
        </div>
      )}
      {status !== 'loading' && (
        <button
          onClick={fetchSongs}
          className="mt-2 text-xs underline hover:no-underline"
        >
          Refresh songs
        </button>
      )}
    </div>
  )
}

