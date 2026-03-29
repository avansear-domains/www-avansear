import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** `visited` = dot on map; `wishes` = star on map. */
export type TravelogueMarkerType = 'visited' | 'wishes'

export type TravelogueMarkerRow = {
  id: string
  latitude: number
  longitude: number
  marker_text: string
  marker_type: TravelogueMarkerType
  sort_rank: number
}

function getAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/** Public read for the map (anon key + RLS). */
export async function fetchTravelogueMarkersPublic(): Promise<TravelogueMarkerRow[]> {
  const supabase = getAnonClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('travelogue_markers')
    .select('id, latitude, longitude, marker_text, marker_type, sort_rank')
    .order('sort_rank', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('fetchTravelogueMarkersPublic:', error.message)
    return []
  }

  return (data ?? []) as TravelogueMarkerRow[]
}

export function createServiceRoleSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
