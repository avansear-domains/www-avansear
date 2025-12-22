import { getArchivedSongs } from '../../../musix/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const songs = await getArchivedSongs()
    const latestSong = songs.length > 0 ? songs[0] : null
    
    if (!latestSong) {
      return NextResponse.json({ 
        songName: null, 
        artist: null, 
        albumArt: null 
      })
    }

    // Get thumbnail from YouTube using the video ID
    // Try maxresdefault first (highest quality), fallback to hqdefault
    const maxResUrl = `https://img.youtube.com/vi/${latestSong.youtubeId}/maxresdefault.jpg`
    const hqDefaultUrl = `https://img.youtube.com/vi/${latestSong.youtubeId}/hqdefault.jpg`
    
    // Check if maxresdefault exists by trying to fetch it
    try {
      const thumbnailResponse = await fetch(maxResUrl, { method: 'HEAD' })
      const albumArt = thumbnailResponse.ok ? maxResUrl : hqDefaultUrl
      
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: albumArt,
        albumName: null // YouTube doesn't provide album name
      })
    } catch (error) {
      // Fallback to hqdefault if maxresdefault check fails
      return NextResponse.json({
        songName: latestSong.songName,
        artist: latestSong.artist,
        albumArt: hqDefaultUrl,
        albumName: null
      })
    }
  } catch (error) {
    console.error('Error fetching album art:', error)
    return NextResponse.json({ 
      songName: null, 
      artist: null, 
      albumArt: null 
    }, { status: 500 })
  }
}

