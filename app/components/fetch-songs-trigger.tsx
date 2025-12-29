'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function FetchSongsTrigger() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate-limited'>('idle')
  const [message, setMessage] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  async function fetchSongs() {
    try {
      setStatus('loading')
      setMessage('Fetching songs from playlist...')
      setOutput('')
      setShowDetails(false)
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
        if (data.output) {
          setOutput(data.output)
          setShowDetails(true)
        }
        if (data.error) {
          setOutput((data.output || '') + '\n\nError: ' + data.error)
          setShowDetails(true)
        }
        return
      }

      setStatus('success')
      setMessage(data.message || 'Songs updated successfully')
      if (data.output) {
        setOutput(data.output)
        setShowDetails(true)
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
      
      // Clear message after 10 seconds (longer to see details)
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
        setOutput('')
        setShowDetails(false)
      }, 10000)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to fetch songs')
      setOutput(error instanceof Error ? error.message : 'Unknown error')
      setShowDetails(true)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  // Only show UI for errors or rate limiting, hide success/loading states
  if (status === 'idle' || status === 'loading' || status === 'success') {
    return null
  }

  return (
    <div className="mb-4 p-3 rounded-lg border text-sm">
      {status === 'error' && (
        <div>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
            <span>✗</span>
            <span>{message}</span>
            <button
              onClick={fetchSongs}
              className="ml-2 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
          {output && (
            <div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs underline hover:no-underline mb-2"
              >
                {showDetails ? 'Hide' : 'Show'} details
              </button>
              {showDetails && (
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto max-h-96 whitespace-pre-wrap">
                  {output}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
      {status === 'rate-limited' && (
        <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
          <span>⚠</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}

