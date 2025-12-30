import { createClient } from '@supabase/supabase-js'

export interface ArchivedSong {
  week: string
  songName: string
  artist: string
  youtubeId?: string
  spotifyTrackId?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function getArchivedSongs(): Promise<ArchivedSong[]> {
  const { data, error } = await supabase
    .from('musix_songs')
    .select('week, song_name, artist, youtube_id, spotify_track_id')
    .order('week', { ascending: false })

  if (error) {
    console.error('Error fetching songs:', error)
    return []
  }

  return (data || []).map((song) => ({
    week: song.week,
    songName: song.song_name,
    artist: song.artist,
    youtubeId: song.youtube_id,
    spotifyTrackId: song.spotify_track_id,
  }))
}

export async function addSong(song: {
  week: string
  songName: string
  artist: string
  youtubeId?: string
  spotifyTrackId?: string
}): Promise<boolean> {
  const { error } = await supabase.from('musix_songs').insert({
    week: song.week,
    song_name: song.songName,
    artist: song.artist,
    youtube_id: song.youtubeId || null,
    spotify_track_id: song.spotifyTrackId || null,
  })

  if (error) {
    console.error('Error adding song:', error)
    return false
  }

  return true
}

export async function songExists(youtubeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('musix_songs')
    .select('youtube_id')
    .eq('youtube_id', youtubeId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" which is fine
    console.error('Error checking song:', error)
  }

  return !!data
}

export async function updateSongYoutubeId(spotifyTrackId: string, youtubeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('musix_songs')
    .update({ youtube_id: youtubeId })
    .eq('spotify_track_id', spotifyTrackId)

  if (error) {
    console.error('Error updating YouTube ID:', error)
    return false
  }

  return true
}

export async function getMaxWeek(): Promise<number> {
  const { data, error } = await supabase
    .from('musix_songs')
    .select('week')
    .order('week', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return 0
  }

  const weekNum = parseInt(data.week.replace(/\D/g, ''))
  return weekNum || 0
}

export async function getExistingSongs(): Promise<{
  songsById: Record<string, { week: string; songName: string; artist: string; spotifyTrackId?: string }>
  songsByNameArtist: Record<string, { week: string; songName: string; artist: string; spotifyTrackId?: string }>
  maxWeek: number
}> {
  const { data, error } = await supabase
    .from('musix_songs')
    .select('spotify_track_id, week, song_name, artist')

  if (error) {
    console.error('Error fetching existing songs:', error)
    return { songsById: {}, songsByNameArtist: {}, maxWeek: 0 }
  }

  const songsById: Record<string, { week: string; songName: string; artist: string; spotifyTrackId?: string }> = {}
  const songsByNameArtist: Record<string, { week: string; songName: string; artist: string; spotifyTrackId?: string }> = {}
  let maxWeek = 0

  for (const song of data || []) {
    const spotifyTrackId = song.spotify_track_id
    const week = song.week
    const songName = song.song_name
    const artist = song.artist

    // Only add to songsById if it has a Spotify track ID (for Spotify ID-based duplicate checking)
    if (spotifyTrackId) {
      songsById[spotifyTrackId] = {
        week,
        songName,
        artist,
        spotifyTrackId,
      }
    }

    // Track ALL songs by normalized song name + artist (case-insensitive) for duplicate checking
    // This ensures we catch duplicates even if they were added via the old Python script
    const normalizedKey = `${songName.toLowerCase().trim()}|${artist.toLowerCase().trim()}`
    // Only overwrite if this entry doesn't exist, or if this one has a Spotify ID (prefer entries with Spotify IDs)
    if (!songsByNameArtist[normalizedKey] || spotifyTrackId) {
      songsByNameArtist[normalizedKey] = {
        week,
        songName,
        artist,
        spotifyTrackId: spotifyTrackId || undefined,
      }
    }

    // Extract week number from ALL songs to get accurate maxWeek
    const weekMatch = week.match(/\d+/)
    const weekNum = weekMatch ? parseInt(weekMatch[0]) : 0
    maxWeek = Math.max(maxWeek, weekNum)
  }

  return { songsById, songsByNameArtist, maxWeek }
}

export async function getRateLimitExecutions(): Promise<number[]> {
  const { data, error } = await supabase
    .from('musix_rate_limit')
    .select('executed_at')
    .order('executed_at', { ascending: false })

  if (error) {
    console.error('Error fetching rate limit executions:', error)
    return []
  }

  return (data || []).map((row: { executed_at: string }) => new Date(row.executed_at).getTime())
}

export async function addRateLimitExecution(): Promise<void> {
  const { error } = await supabase
    .from('musix_rate_limit')
    .insert({ executed_at: new Date().toISOString() })

  if (error) {
    console.error('Error recording rate limit execution:', error)
  }
}

export async function cleanOldRateLimitExecutions(windowHours: number): Promise<void> {
  const cutoffTime = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString()
  
  const { error } = await supabase
    .from('musix_rate_limit')
    .delete()
    .lt('executed_at', cutoffTime)

  if (error) {
    console.error('Error cleaning old rate limit executions:', error)
  }
}

