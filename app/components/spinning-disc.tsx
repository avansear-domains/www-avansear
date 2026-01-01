'use client'

import { useEffect, useState, useRef } from 'react'
import { Play } from 'lucide-react'

interface AlbumInfo {
  songName: string
  artist: string
  albumArt: string | null
  albumName: string | null
}

export function SpinningDisc() {
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const discRef = useRef<HTMLButtonElement>(null)
  const rotationRef = useRef<number>(0)
  const animationStartTimeRef = useRef<number | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    fetch('/api/musix/album-art')
      .then((res) => {
        if (!res.ok) {
          // Log error but don't break - gracefully handle 404s or other errors
          console.warn('Failed to fetch album art:', res.status, res.statusText)
          return { songName: null, artist: null, albumArt: null, albumName: null }
        }
        return res.json()
      })
      .then((data) => {
        if (data && data.songName) {
          setAlbumInfo(data)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        // Silently handle errors - don't break the UI
        console.warn('Failed to fetch album art:', err)
        setIsLoading(false)
      })
  }, [])

  // Track rotation angle when playing
  useEffect(() => {
    if (!discRef.current) return

    if (isPlaying) {
      // Start/resume animation from current rotation
      const startRotation = rotationRef.current
      // Calculate what time would produce the current rotation (8s per full rotation)
      animationStartTimeRef.current = performance.now() - (startRotation / 360) * 8000
      
      const updateRotation = () => {
        if (!discRef.current || !animationStartTimeRef.current) return
        
        const elapsed = performance.now() - animationStartTimeRef.current
        // Calculate rotation: elapsed time / 8s * 360 degrees, normalized to 0-360
        rotationRef.current = (elapsed / 8000) * 360 % 360
        
        discRef.current.style.transform = `rotate(${rotationRef.current}deg)`
        animationFrameRef.current = requestAnimationFrame(updateRotation)
      }
      
      animationFrameRef.current = requestAnimationFrame(updateRotation)
    } else {
      // Pause animation - preserve current rotation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      
      // Capture current rotation from computed style
      if (discRef.current) {
        const computedStyle = window.getComputedStyle(discRef.current)
        const matrix = computedStyle.transform
        if (matrix && matrix !== 'none') {
          const values = matrix.split('(')[1].split(')')[0].split(',')
          const a = parseFloat(values[0])
          const b = parseFloat(values[1])
          const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI))
          rotationRef.current = angle < 0 ? angle + 360 : angle
          discRef.current.style.transform = `rotate(${rotationRef.current}deg)`
        }
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying])

  // Listen for audio playing state changes
  useEffect(() => {
    const handleAudioPlaying = (event: CustomEvent<boolean>) => {
      setIsPlaying(event.detail)
    }

    window.addEventListener('audioPlaying', handleAudioPlaying as EventListener)

    return () => {
      window.removeEventListener('audioPlaying', handleAudioPlaying as EventListener)
    }
  }, [])

  // Handle play/pause button click
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPlaying) {
      // If playing, pause the audio
      window.dispatchEvent(new CustomEvent('triggerAudioPause'))
    } else {
      // If not playing, start playback
      window.dispatchEvent(new CustomEvent('triggerAudioPlay'))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-[var(--color-light-80)]">Loading...</div>
      </div>
    )
  }

  if (!albumInfo) {
    return null
  }

  return (
    <div className="flex flex-row items-center gap-6 py-8">
      {/* Spinning Disc */}
      <div className="relative flex-shrink-0">
        <button
          ref={discRef}
          type="button"
          onClick={handlePlayClick}
          className="relative rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg focus:outline-none hover:opacity-90 active:opacity-80"
          style={{ width: '100px', height: '100px' }}
          aria-label={isPlaying ? 'Pause song' : 'Play song'}
          title="click to play/pause"
        >
          {albumInfo.albumArt ? (
            <div className="relative w-full h-full">
              <img 
                src={albumInfo.albumArt} 
                alt={`${albumInfo.albumName || albumInfo.songName} cover`}
                className="w-full h-full object-cover"
              />
              {/* 50% overlay of --color-dark */}
              <div 
                className="absolute inset-0 z-0"
                style={{ backgroundColor: 'var(--color-dark)', opacity: 0.5 }}
              ></div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-2xl">🎵</div>
            </div>
          )}

          {/* Play button overlay before audio is playing */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Play 
                className="w-8 h-8 ml-0.5" 
                style={{ fill: 'var(--color-light)', color: 'var(--color-light)' }}
              />
            </div>
          )}

          {/* Center dot when audio is playing */}
          {isPlaying && (
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10 shadow-md"
              style={{ backgroundColor: 'var(--color-light)' }}
            ></div>
          )}
        </button>
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold tracking-tighter text-[var(--color-dark)] dark:text-[var(--color-light)]">
          {albumInfo.songName.toLowerCase()}
        </h3>
        <p className="text-sm tracking-tight text-[var(--color-light-80)]">
          {albumInfo.artist.toLowerCase()}
        </p>
        {albumInfo.albumName && (
          <p className="text-xs tracking-tight text-[var(--color-light-80)] italic">
            {albumInfo.albumName.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  )
}

