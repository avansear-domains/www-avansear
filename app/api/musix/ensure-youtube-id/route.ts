import { getArchivedSongs, updateSongYoutubeId } from '../../../musix/db'
import { NextResponse } from 'next/server'
import { YouTube } from 'youtube-sr'

async function searchYouTubeVideo(songName: string, artist: string): Promise<string | null> {
  try {
    // Search query: "song name - artist"
    const query = `${songName} - ${artist}`.trim()
    
    // Use youtube-sr to search without API key
    const results = await YouTube.search(query, {
      limit: 1,
      type: 'video',
    })
    
    if (results.length > 0) {
      return results[0].id || null
    }

    return null
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return null
  }
}

export async function GET() {
  try {
    const songs = await getArchivedSongs()
    const latestSong = songs.length > 0 ? songs[0] : null
    
    if (!latestSong) {
      return NextResponse.json({ success: false, message: 'No songs found' })
    }

    // If latest song already has YouTube ID, we're done
    if (latestSong.youtubeId) {
      return NextResponse.json({ 
        success: true, 
        message: 'Latest song already has YouTube ID',
        youtubeId: latestSong.youtubeId
      })
    }

    // If no Spotify track ID, we can't search
    if (!latestSong.spotifyTrackId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Latest song has no Spotify track ID to search with' 
      })
    }

    // Search YouTube for the latest song (no API key needed with youtube-sr)
    const youtubeId = await searchYouTubeVideo(
      latestSong.songName,
      latestSong.artist
    )

    if (!youtubeId) {
      return NextResponse.json({ 
        success: false, 
        message: `No YouTube video found for "${latestSong.songName} - ${latestSong.artist}"` 
      })
    }

    // Update the song with YouTube ID
    const updated = await updateSongYoutubeId(latestSong.spotifyTrackId, youtubeId)
    
    if (updated) {
      return NextResponse.json({ 
        success: true, 
        message: 'YouTube ID found and updated',
        youtubeId 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Found YouTube ID but failed to update database' 
      })
    }
  } catch (error: any) {
    console.error('Error ensuring YouTube ID:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 })
  }
}

