import { getArchivedSongs } from '../../../musix/db'
import { NextResponse } from 'next/server'

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
        spotifyTrackId: null 
      })
    }
    
    return NextResponse.json({ 
      songName: latestSong.songName,
      artist: latestSong.artist,
      spotifyTrackId: latestSong.spotifyTrackId || null
    })
  } catch (error) {
    console.error('Error fetching latest song:', error)
    return NextResponse.json({ 
      songName: null, 
      artist: null,
      spotifyTrackId: null 
    }, { status: 500 })
  }
}

