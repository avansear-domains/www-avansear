import { NextResponse } from 'next/server'
import { YouTube } from 'youtube-sr'

export async function POST(request: Request) {
  try {
    const { songName, artist } = await request.json()

    if (!songName || !artist) {
      return NextResponse.json(
        { success: false, message: 'songName and artist are required' },
        { status: 400 }
      )
    }

    // Search query: "song name - artist"
    const query = `${songName} - ${artist}`.trim()
    
    console.log('Searching YouTube for:', query)
    
    // Use youtube-sr to search without API key
    const results = await YouTube.search(query, {
      limit: 1,
      type: 'video',
    })
    
    if (results.length > 0 && results[0].id) {
      return NextResponse.json({
        success: true,
        youtubeId: results[0].id,
        title: results[0].title,
      })
    }

    return NextResponse.json({
      success: false,
      message: 'No YouTube video found',
    })
  } catch (error: any) {
    console.error('Error searching YouTube:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error searching YouTube',
        error: error.message,
      },
      { status: 500 }
    )
  }
}

