import { getArchivedSongs } from '../../../musix/db'
import { NextResponse } from 'next/server'

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyTrackResponse {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; height: number; width: number }>
  }
}

async function getSpotifyAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Spotify auth error: ${response.status} ${error}`)
  }

  const data: SpotifyTokenResponse = await response.json()
  return data.access_token
}

async function getSpotifyTrackInfo(accessToken: string, trackId: string): Promise<{ albumArt: string | null; albumName: string | null; success: boolean }> {
  try {
    const url = `https://api.spotify.com/v1/tracks/${trackId}`
    console.log('Spotify API: Fetching track info for trackId:', trackId)
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Spotify API returned non-OK status:', response.status, response.statusText, errorText)
      return { albumArt: null, albumName: null, success: false }
    }

    const data: SpotifyTrackResponse = await response.json()
    
    console.log('Spotify API response:', {
      trackName: data.name,
      albumName: data.album?.name,
      hasImages: !!data.album?.images,
      imageCount: data.album?.images?.length || 0,
      imageSizes: data.album?.images?.map((img, idx) => ({
        index: idx,
        height: img.height,
        width: img.width,
        urlPreview: img.url?.substring(0, 50) || 'N/A',
      })) || [],
    })

    if (!data.album) {
      console.warn('Spotify API: No album data found for track')
      return { albumArt: null, albumName: null, success: false }
    }

    const albumName = data.album.name || null
    
    // Get the largest image (usually the first one, sorted by size)
    // Spotify images are typically sorted largest to smallest
    const images = data.album.images || []
    let albumArt: string | null = null
    
    if (images.length > 0) {
      // Use the first image (largest) or find the best one
      // Spotify typically provides images in order: large, medium, small
      albumArt = images[0]?.url || null
      
      // If first image is missing, try others
      if (!albumArt) {
        for (const img of images) {
          if (img.url && img.url.trim() !== '') {
            albumArt = img.url
            break
          }
        }
      }
      
      console.log('Spotify API: Selected album art:', {
        albumArt: albumArt ? `${albumArt.substring(0, 50)}...` : 'null',
        imageIndex: 0,
        imageHeight: images[0]?.height,
        imageWidth: images[0]?.width,
      })
    } else {
      console.warn('Spotify API: No images found for album')
    }

    return { albumArt, albumName, success: true }
  } catch (error) {
    console.error('Error fetching from Spotify:', error)
    return { albumArt: null, albumName: null, success: false }
  }
}

// Force dynamic rendering to ensure latest song is always fetched fresh
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const isDebugMode = url.searchParams.get('debug') === 'true'
  
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

    // Check if we have Spotify credentials
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.warn('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET not found in environment variables - album art will not be fetched')
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: null,
        albumName: null,
        ...(isDebugMode && { debug: { error: 'Spotify credentials not found' } }),
      }, { status: 200 })
    }

    // Check if we have a Spotify track ID
    if (!latestSong.spotifyTrackId) {
      console.warn('No Spotify track ID found for latest song - cannot fetch album art')
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: null,
        albumName: null,
        ...(isDebugMode && { debug: { error: 'No spotifyTrackId found' } }),
      }, { status: 200 })
    }

    // Get Spotify access token
    console.log('Album Art API: Fetching for song:', {
      songName: latestSong.songName,
      artist: latestSong.artist,
      spotifyTrackId: latestSong.spotifyTrackId,
    })
    
    let accessToken: string
    try {
      accessToken = await getSpotifyAccessToken(clientId, clientSecret)
    } catch (error) {
      console.error('Failed to get Spotify access token:', error)
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: null,
        albumName: null,
        ...(isDebugMode && { debug: { error: 'Failed to get Spotify access token', details: String(error) } }),
      }, { status: 200 })
    }

    // Get track info from Spotify
    const { albumArt, albumName, success } = await getSpotifyTrackInfo(
      accessToken,
      latestSong.spotifyTrackId
    )
    
    console.log('Album Art API: Final result:', {
      albumArt: albumArt ? `${albumArt.substring(0, 50)}...` : 'null',
      albumName: albumName || 'null',
      albumArtType: typeof albumArt,
      albumArtLength: albumArt?.length || 0,
      success,
    })
    
    // Always return 200 with song info, even if album art is null
    // This prevents Spotify errors from causing 500 responses
    return NextResponse.json({
      songName: latestSong.songName,
      artist: latestSong.artist,
      albumArt: albumArt,
      albumName: albumName,
      ...(isDebugMode && { 
        debug: {
          albumArtType: typeof albumArt,
          albumArtLength: albumArt?.length || 0,
          albumArtPreview: albumArt?.substring(0, 100) || null,
          hasAlbumArt: !!albumArt,
          success,
          spotifyTrackId: latestSong.spotifyTrackId,
        }
      }),
    }, { status: 200 })
  } catch (error) {
    // Only catch unexpected errors here
    console.error('Error fetching album art (unexpected error):', error)
    return NextResponse.json({ 
      songName: null, 
      artist: null, 
      albumArt: null,
      albumName: null,
      ...(isDebugMode && { debug: { error: 'Unexpected error', details: String(error) } }),
    }, { status: 200 })
  }
}
