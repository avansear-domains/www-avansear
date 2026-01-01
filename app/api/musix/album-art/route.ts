import { getArchivedSongs } from '../../../musix/db'
import { NextResponse } from 'next/server'

interface LastFmTrackInfo {
  track?: {
    name: string
    artist: {
      name: string
    }
    album?: {
      title: string
      image: Array<{ '#text': string; size: string }>
    }
  }
  results?: {
    trackmatches?: {
      track?: Array<{
        name: string
        artist: string
        image: Array<{ '#text': string; size: string }>
      }>
    }
  }
  error?: number
  message?: string
}

async function tryTrackGetInfo(apiKey: string, songName: string, artist: string): Promise<{ albumArt: string | null; albumName: string | null; success: boolean }> {
  const params = new URLSearchParams({
    method: 'track.getInfo',
    api_key: apiKey,
    artist: artist,
    track: songName,
    format: 'json',
  })

  const url = `https://ws.audioscrobbler.com/2.0/?${params}`
  console.log('Last.fm API request (track.getInfo):', { songName, artist, url: url.replace(apiKey, 'REDACTED') })
  
  const response = await fetch(url)

  if (!response.ok) {
    console.error('Last.fm API returned non-OK status:', response.status, response.statusText)
    return { albumArt: null, albumName: null, success: false }
  }

  const data: LastFmTrackInfo = await response.json()
  console.log('Last.fm API response structure:', {
    hasTrack: !!data.track,
    hasAlbum: !!data.track?.album,
    albumTitle: data.track?.album?.title,
    hasImages: !!data.track?.album?.image,
    imageCount: data.track?.album?.image?.length || 0,
    error: data.error,
    message: data.message,
  })

  // Check for Last.fm API errors (they return 200 with error in JSON)
  if (data.error) {
    console.error('Last.fm API error:', data.error, data.message)
    return { albumArt: null, albumName: null, success: false }
  }

  // Check if track exists
  if (!data.track) {
    console.warn('Last.fm API: No track data found')
    return { albumArt: null, albumName: null, success: false }
  }

  // Check if album exists
  if (!data.track.album) {
    console.warn('Last.fm API: No album data found for track')
    return { albumArt: null, albumName: null, success: false }
  }

  // Check if images exist
  if (!data.track.album.image || !Array.isArray(data.track.album.image) || data.track.album.image.length === 0) {
    console.warn('Last.fm API: No image data found for album')
    // Still return album name if available, even without art
    return { albumArt: null, albumName: data.track.album.title || null, success: true }
  }

  // Get the largest image (usually the last one in the array)
  const images = data.track.album.image
  const largestImage = images[images.length - 1]
  const albumArt = largestImage?.['#text'] || null
  const albumName = data.track.album.title || null

  console.log('Last.fm API: Extracted album info:', { albumArt: albumArt ? 'found' : 'null', albumName })

  return { albumArt, albumName, success: true }
}

async function getLastFmAlbumArt(apiKey: string, songName: string, artist: string): Promise<{ albumArt: string | null; albumName: string | null }> {
  try {
    // Try with full artist name first
    let result = await tryTrackGetInfo(apiKey, songName, artist)
    if (result.success && (result.albumArt || result.albumName)) {
      return { albumArt: result.albumArt, albumName: result.albumName }
    }

    // If that fails and artist has a comma, try with just the first artist
    if (artist.includes(',')) {
      const firstArtist = artist.split(',')[0].trim()
      console.log('Trying with first artist only:', firstArtist)
      result = await tryTrackGetInfo(apiKey, songName, firstArtist)
      if (result.success && (result.albumArt || result.albumName)) {
        return { albumArt: result.albumArt, albumName: result.albumName }
      }
    }

    // If track.getInfo fails, try search fallback
    console.warn('Last.fm track.getInfo failed, trying search fallback')
    return await tryLastFmSearch(apiKey, songName, artist)
  } catch (error) {
    console.error('Error fetching from Last.fm:', error)
    return { albumArt: null, albumName: null }
  }
}

async function tryLastFmSearch(apiKey: string, songName: string, artist: string): Promise<{ albumArt: string | null; albumName: string | null }> {
  try {
    // Try track.search as fallback - search for "songName artist"
    const searchQuery = `${songName} ${artist.split(',')[0].trim()}` // Use first artist if comma-separated
    const params = new URLSearchParams({
      method: 'track.search',
      api_key: apiKey,
      track: searchQuery,
      format: 'json',
      limit: '5',
    })

    const url = `https://ws.audioscrobbler.com/2.0/?${params}`
    console.log('Last.fm API fallback search:', { searchQuery, url: url.replace(apiKey, 'REDACTED') })
    
    const response = await fetch(url)

    if (!response.ok) {
      console.error('Last.fm search API returned non-OK status:', response.status)
      return { albumArt: null, albumName: null }
    }

    const data: LastFmTrackInfo = await response.json()

    if (data.error) {
      console.error('Last.fm search API error:', data.error, data.message)
      return { albumArt: null, albumName: null }
    }

    // Find best match from search results
    const tracks = data.results?.trackmatches?.track
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      console.warn('Last.fm search: No tracks found')
      return { albumArt: null, albumName: null }
    }

    // Use first result (most relevant)
    const firstTrack = tracks[0]
    if (firstTrack.image && Array.isArray(firstTrack.image) && firstTrack.image.length > 0) {
      const largestImage = firstTrack.image[firstTrack.image.length - 1]
      const albumArt = largestImage?.['#text'] || null
      console.log('Last.fm search: Found album art from search results')
      // Note: track.search doesn't return album name, only images
      return { albumArt, albumName: null }
    }

    return { albumArt: null, albumName: null }
  } catch (error) {
    console.error('Error in Last.fm search fallback:', error)
    return { albumArt: null, albumName: null }
  }
}

// Force dynamic rendering to ensure latest song is always fetched fresh
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const songs = await getArchivedSongs()
    const latestSong = songs.length > 0 ? songs[0] : null
    
    if (!latestSong) {
      return NextResponse.json({ 
        songName: null, 
        artist: null, 
        albumArt: null,
        albumName: null
      }, { status: 200 })
    }

    const lastFmApiKey = process.env.LASTFM_API_KEY
    if (!lastFmApiKey) {
      console.warn('LASTFM_API_KEY not found in environment variables - album art will not be fetched')
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: null,
        albumName: null,
      }, { status: 200 })
    }

    // Get album art from Last.fm
    // getLastFmAlbumArt handles errors gracefully and returns null values
    const { albumArt, albumName } = await getLastFmAlbumArt(
      lastFmApiKey,
      latestSong.songName,
      latestSong.artist
    )
    
    // Always return 200 with song info, even if album art is null
    // This prevents Last.fm errors from causing 500 responses
    return NextResponse.json({
      songName: latestSong.songName,
      artist: latestSong.artist,
      albumArt: albumArt,
      albumName: albumName,
    }, { status: 200 })
  } catch (error) {
    // Only catch database errors here - Last.fm errors are handled in getLastFmAlbumArt
    console.error('Error fetching album art (database error):', error)
    return NextResponse.json({ 
      songName: null, 
      artist: null, 
      albumArt: null,
      albumName: null
    }, { status: 200 })
  }
}
