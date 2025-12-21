import { createClient } from '@supabase/supabase-js'

export interface ArchivedSong {
  week: string
  songName: string
  artist: string
  youtubeId: string
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
    .select('week, song_name, artist, youtube_id')
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
  }))
}

export async function addSong(song: {
  week: string
  songName: string
  artist: string
  youtubeId: string
}): Promise<boolean> {
  const { error } = await supabase.from('musix_songs').insert({
    week: song.week,
    song_name: song.songName,
    artist: song.artist,
    youtube_id: song.youtubeId,
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

