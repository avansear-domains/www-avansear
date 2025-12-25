import { getArchivedSongs } from '../../../musix/db'
import { NextResponse } from 'next/server'

interface LastFmTrackInfo {
  track: {
    name: string
    artist: {
      name: string
    }
    album?: {
      title: string
      image: Array<{ '#text': string; size: string }>
    }
  }
}

async function getLastFmAlbumArt(apiKey: string, songName: string, artist: string): Promise<{ albumArt: string | null; albumName: string | null }> {
  try {
    const params = new URLSearchParams({
      method: 'track.getInfo',
      api_key: apiKey,
      artist: artist,
      track: songName,
      format: 'json',
    })

    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`)

    if (!response.ok) {
      return { albumArt: null, albumName: null }
    }

    const data: LastFmTrackInfo = await response.json()

    if (data.track?.album?.image) {
      // Get the largest image (usually the last one in the array)
      const images = data.track.album.image
      const largestImage = images[images.length - 1]
      const albumArt = largestImage?.['#text'] || null
      const albumName = data.track.album.title || null

      return { albumArt, albumName }
    }

    return { albumArt: null, albumName: null }
  } catch (error) {
    console.error('Error fetching from Last.fm:', error)
    return { albumArt: null, albumName: null }
  }
}

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
      })
    }

    const lastFmApiKey = process.env.LASTFM_API_KEY
    if (!lastFmApiKey) {
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: null,
        albumName: null,
      })
    }

    // Get album art from Last.fm
    const { albumArt, albumName } = await getLastFmAlbumArt(
      lastFmApiKey,
      latestSong.songName,
      latestSong.artist
    )
    
    return NextResponse.json({
      songName: latestSong.songName,
      artist: latestSong.artist,
      albumArt: albumArt,
      albumName: albumName,
    })
  } catch (error) {
    console.error('Error fetching album art:', error)
    return NextResponse.json({ 
      songName: null, 
      artist: null, 
      albumArt: null,
      albumName: null
    }, { status: 500 })
  }
}
