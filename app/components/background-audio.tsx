'use client'

import { useEffect, useRef } from 'react'

interface BackgroundAudioProps {
  youtubeId: string | null
}

export function BackgroundAudio({ youtubeId }: BackgroundAudioProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isReadyRef = useRef(false)
  const hasInteractedRef = useRef(false)

  useEffect(() => {
    if (!youtubeId) return

    // Load YouTube IFrame API script
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

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
      if (!youtubeId || !containerRef.current) return

      // Create hidden player
      playerRef.current = new window.YT.Player(containerRef.current, {
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
            isReadyRef.current = true
            // Try to play (will be muted)
            event.target.playVideo()
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // Handle state changes if needed
            if (event.data === YT.PlayerState.PLAYING && hasInteractedRef.current) {
              // Unmute after user interaction
              event.target.unMute()
            }
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
      ref={containerRef}
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

