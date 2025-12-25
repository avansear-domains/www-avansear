'use client'

import { useEffect, useRef, useState } from 'react'

interface BackgroundAudioProps {
  // No props needed - will fetch from API
}

export function BackgroundAudio({}: BackgroundAudioProps) {
  const [youtubeId, setYoutubeId] = useState<string | null>(null)
  const youtubeContainerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const isReadyRef = useRef(false)
  const hasInteractedRef = useRef(false)
  const currentYoutubeIdRef = useRef<string | null>(null)

  // Fetch latest song and search YouTube for it
  useEffect(() => {
    async function fetchAndPlayLatestSong() {
      try {
        console.log('BackgroundAudio: Fetching latest song...')
        const response = await fetch('/api/musix/latest-song')
        const data = await response.json()
        
        if (!data.songName || !data.artist) {
          console.log('BackgroundAudio: No song found')
          return
        }

        console.log('BackgroundAudio: Found song:', data.songName, 'by', data.artist)
        
        // Search YouTube for the song
        console.log('BackgroundAudio: Searching YouTube...')
        const searchResponse = await fetch('/api/musix/search-youtube', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            songName: data.songName,
            artist: data.artist,
          }),
        })
        
        const searchData = await searchResponse.json()
        
        if (searchData.youtubeId) {
          console.log('BackgroundAudio: Found YouTube ID:', searchData.youtubeId)
          setYoutubeId(searchData.youtubeId)
        } else {
          console.log('BackgroundAudio: No YouTube video found')
        }
      } catch (error) {
        console.error('BackgroundAudio: Error:', error)
      }
    }

    fetchAndPlayLatestSong()
  }, [])

  // Handle YouTube embed
  useEffect(() => {
    if (!youtubeId) {
      console.log('BackgroundAudio: No youtubeId provided')
      // Destroy player if youtubeId is removed
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
          playerRef.current = null
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      currentYoutubeIdRef.current = null
      return
    }

    // If we already have a player for this video ID, don't reinitialize
    if (currentYoutubeIdRef.current === youtubeId && playerRef.current) {
      console.log('BackgroundAudio: Player already exists for this video ID')
      return
    }

    console.log('BackgroundAudio: Initializing player with youtubeId:', youtubeId)
    currentYoutubeIdRef.current = youtubeId

    // Load YouTube IFrame API script (only if not already loaded)
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    // Wait for YouTube API to be ready
    let checkYT: NodeJS.Timeout | null = null
    
    if (window.YT && window.YT.Player) {
      initializePlayer()
    } else {
      checkYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          if (checkYT) clearInterval(checkYT)
          initializePlayer()
        }
      }, 100)

      // Also handle the onYouTubeIframeAPIReady callback
      window.onYouTubeIframeAPIReady = () => {
        if (checkYT) clearInterval(checkYT)
        initializePlayer()
      }
    }

    function initializePlayer() {
      if (!youtubeId || !youtubeContainerRef.current) {
        console.log('BackgroundAudio: Cannot initialize - missing youtubeId or container')
        return
      }

      console.log('BackgroundAudio: Creating YouTube player with videoId:', youtubeId)
      
      // Destroy existing player if it exists
      if (playerRef.current) {
        try {
          console.log('BackgroundAudio: Destroying existing player')
          playerRef.current.destroy()
        } catch (e) {
          console.error('BackgroundAudio: Error destroying player:', e)
        }
        playerRef.current = null
      }

      // Reset ready state
      isReadyRef.current = false

      // Create hidden player
      console.log('BackgroundAudio: Creating new YouTube player')
      playerRef.current = new window.YT.Player(youtubeContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          mute: 1, // Start muted due to autoplay policies
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            console.log('BackgroundAudio: Player ready, attempting to play')
            isReadyRef.current = true
            // Try to play (will be muted)
            try {
              event.target.playVideo()
            } catch (e) {
              console.error('BackgroundAudio: Error playing video:', e)
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            console.log('BackgroundAudio: Player state changed:', event.data)
            // Handle state changes if needed
            if (event.data === YT.PlayerState.PLAYING && hasInteractedRef.current) {
              console.log('BackgroundAudio: Unmuting after user interaction')
              // Unmute after user interaction
              event.target.unMute()
            }
          },
          onError: (event: YT.PlayerEvent) => {
            console.error('BackgroundAudio: Player error:', event.data)
          },
        },
      })
    }

    // Listen for user interaction to unmute
    const handleInteraction = () => {
      if (!hasInteractedRef.current && isReadyRef.current && playerRef.current) {
        hasInteractedRef.current = true
        try {
          playerRef.current.unMute()
        } catch (e) {
          console.error('Failed to unmute:', e)
        }
      }
    }

    // Add event listeners for user interaction
    const events = ['click', 'touchstart', 'keydown', 'scroll']
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { once: true })
    })

    return () => {
      if (checkYT) clearInterval(checkYT)
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction)
      })
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [youtubeId])

  if (!youtubeId) return null

  return (
    <div
      ref={youtubeContainerRef}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  )
}
