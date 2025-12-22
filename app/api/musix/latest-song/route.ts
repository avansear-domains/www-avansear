import { getArchivedSongs } from '../../../musix/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const songs = await getArchivedSongs()
    const latestSong = songs.length > 0 ? songs[0] : null
    
    if (!latestSong) {
      return NextResponse.json({ youtubeId: null })
    }
    
    return NextResponse.json({ youtubeId: latestSong.youtubeId })
  } catch (error) {
    console.error('Error fetching latest song:', error)
    return NextResponse.json({ youtubeId: null }, { status: 500 })
  }
}

