import { getExistingSongs, addSong, getRateLimitExecutions, addRateLimitExecution, cleanOldRateLimitExecutions } from '../../../musix/db'

const MAX_EXECUTIONS = 50
const WINDOW_HOURS = 24
const SPOTIFY_PLAYLIST_ID = process.env.SPOTIFY_PLAYLIST_ID || '2vKyMZ7DVsdjn8YQ7iCgJP'

function cleanOldExecutions(executions: number[]): number[] {
  const now = Date.now()
  const windowMs = WINDOW_HOURS * 60 * 60 * 1000
  return executions.filter(timestamp => now - timestamp < windowMs)
}

async function checkRateLimit(): Promise<{ allowed: boolean; remaining: number }> {
  // Clean old executions first
  await cleanOldRateLimitExecutions(WINDOW_HOURS)
  
  // Get current executions
  const executions = await getRateLimitExecutions()
  const cleanedExecutions = cleanOldExecutions(executions)
  
  if (cleanedExecutions.length >= MAX_EXECUTIONS) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: MAX_EXECUTIONS - cleanedExecutions.length }
}

async function recordExecution() {
  await addRateLimitExecution()
}

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SpotifyTrack {
  track: {
    id: string
    name: string
    artists: Array<{ name: string }>
    album: {
      name: string
      images: Array<{ url: string; height: number; width: number }>
    }
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

async function getPlaylistTracks(accessToken: string, playlistId: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Spotify API error: ${response.status} ${error}`)
    }

    const data = await response.json()
    
    // Filter out null tracks (removed tracks)
    const validTracks = (data.items || []).filter((item: SpotifyTrack) => item.track !== null)
    tracks.push(...validTracks)

    nextUrl = data.next
  }

  return tracks
}

async function fetchAndAddSongs(clientId: string, clientSecret: string, playlistId: string): Promise<{ success: boolean; output: string; error?: string }> {
  const output: string[] = []

  try {
    output.push('Getting Spotify access token...')
    const accessToken = await getSpotifyAccessToken(clientId, clientSecret)
    output.push('Access token obtained')

    output.push(`Fetching playlist tracks from playlist: ${playlistId}`)
    const playlistTracks = await getPlaylistTracks(accessToken, playlistId)
    output.push(`Found ${playlistTracks.length} tracks in playlist`)

    // Get existing songs from database
    const { songsById, songsByNameArtist, maxWeek } = await getExistingSongs()
    output.push(`Found ${Object.keys(songsById).length} existing songs with Spotify IDs in database`)
    output.push(`Found ${Object.keys(songsByNameArtist).length} total unique songs (by name+artist) in database`)
    output.push(`Max week number: ${maxWeek}`)

    // Process playlist tracks in order they appear in playlist
    let newSongsCount = 0
    let newWeek = maxWeek + 1

    for (const item of playlistTracks) {
      const track = item.track
      const spotifyTrackId = track.id
      const songName = track.name
      const artist = track.artists.map(a => a.name).join(', ') // Handle multiple artists

      // Skip if already in database by Spotify track ID
      if (spotifyTrackId in songsById) {
        output.push(`  Skipping (duplicate track ID): ${songName} by ${artist} (${spotifyTrackId})`)
        continue
      }

      // Check for duplicate by normalized song name + artist (case-insensitive)
      const normalizedKey = `${songName.toLowerCase().trim()}|${artist.toLowerCase().trim()}`
      if (normalizedKey in songsByNameArtist) {
        const existing = songsByNameArtist[normalizedKey]
        output.push(
          `  Skipping (duplicate song): ${songName} by ${artist} (already exists as ${existing.songName} by ${existing.artist} in ${existing.week})`
        )
        continue
      }

      // Format week string
      const weekStr = `week ${newWeek.toString().padStart(2, '0')}`

      // Add to database
      const added = await addSong({
        week: weekStr,
        songName,
        artist,
        spotifyTrackId,
      })

      if (added) {
        output.push(`  Added: week ${newWeek.toString().padStart(2, '0')} - ${songName} by ${artist} (${spotifyTrackId})`)
        newSongsCount++
        newWeek++
      } else {
        output.push(`  Failed to add: ${songName} by ${artist} (${spotifyTrackId})`)
      }
    }

    if (newSongsCount === 0) {
      output.push('No new songs to add!')
    } else {
      output.push(`\nSuccessfully added ${newSongsCount} new song(s) to database!`)
    }

    return {
      success: true,
      output: output.join('\n'),
    }
  } catch (error: any) {
    return {
      success: false,
      output: output.join('\n'),
      error: error.message || 'Unknown error occurred',
    }
  }
}

export async function GET() {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit()
    
    if (!rateLimit.allowed) {
      return Response.json(
        { 
          success: false, 
          message: `Rate limit exceeded. Maximum ${MAX_EXECUTIONS} executions per ${WINDOW_HOURS} hours.`,
          remaining: 0
        },
        { status: 429 }
      )
    }

    // Get Spotify credentials
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const playlistId = process.env.SPOTIFY_PLAYLIST_ID || SPOTIFY_PLAYLIST_ID || '2vKyMZ7DVsdjn8YQ7iCgJP'

    if (!clientId || !clientSecret) {
      return Response.json(
        { 
          success: false, 
          message: 'SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET not found in environment variables',
          remaining: rateLimit.remaining
        },
        { status: 500 }
      )
    }

    if (!playlistId) {
      return Response.json(
        { 
          success: false, 
          message: 'SPOTIFY_PLAYLIST_ID not found in environment variables',
          remaining: rateLimit.remaining
        },
        { status: 500 }
      )
    }
    
    // Record execution
    await recordExecution()
    
    // Fetch and add songs (YouTube search uses youtube-sr, no API key needed)
    const result = await fetchAndAddSongs(clientId, clientSecret, playlistId)
    
    if (!result.success) {
      return Response.json(
        { 
          success: false, 
          message: 'Failed to fetch songs',
          output: result.output,
          error: result.error,
          remaining: rateLimit.remaining - 1
        },
        { status: 500 }
      )
    }
    
    return Response.json({
      success: true,
      message: 'Songs fetched successfully',
      output: result.output,
      remaining: rateLimit.remaining - 1
    })
  } catch (error: any) {
    return Response.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    )
  }
}
