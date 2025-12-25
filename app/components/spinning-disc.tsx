'use client'

import { useEffect, useState } from 'react'

interface AlbumInfo {
  songName: string
  artist: string
  albumArt: string | null
  albumName: string | null
}

export function SpinningDisc() {
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/musix/album-art')
      .then((res) => {
        if (!res.ok) {
          console.error('Failed to fetch album art:', res.status, res.statusText)
          return { songName: null, artist: null, albumArt: null, albumName: null }
        }
        return res.json()
      })
      .then((data) => {
        if (data.songName) {
          setAlbumInfo(data)
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch album art:', err)
        setIsLoading(false)
      })
  }, [])

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
        <div 
          className="spinning-disc rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg"
          style={{ width: '100px', height: '100px' }}
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
        </div>
        {/* Center dot */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10 shadow-md"
          style={{ backgroundColor: 'var(--color-light)' }}
        ></div>
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

