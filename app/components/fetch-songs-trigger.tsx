'use client'

import { useEffect, useState } from 'react'

export function FetchSongsTrigger() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'rate-limited'>('idle')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    let mounted = true

    async function fetchSongs() {
      try {
        setStatus('loading')
        const response = await fetch('/api/musix/fetch-songs')
        const data = await response.json()

        if (!mounted) return

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
        
        // Clear message after 3 seconds
        setTimeout(() => {
          if (mounted) {
            setStatus('idle')
            setMessage('')
          }
        }, 3000)
      } catch (error) {
        if (!mounted) return
        setStatus('error')
        setMessage('Failed to fetch songs')
      }
    }

    fetchSongs()

    return () => {
      mounted = false
    }
  }, [])

  // Don't render anything - this runs silently in the background
  return null
}

