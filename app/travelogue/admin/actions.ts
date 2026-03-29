'use server'

import { cookies } from 'next/headers'
import {
  createTravelogueAdminSessionToken,
  TRAVELOGUE_ADMIN_COOKIE,
  verifyTravelogueAdminSessionToken,
} from 'lib/travelogue-admin-session'
import { createServiceRoleSupabase, type TravelogueMarkerType } from 'lib/travelogue-markers'

async function requireAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyTravelogueAdminSessionToken(cookieStore.get(TRAVELOGUE_ADMIN_COOKIE)?.value)
}

export type AddTravelogueMarkerResult = { ok: true } | { ok: false; error: string }

export async function addTravelogueMarkerAction(formData: FormData): Promise<AddTravelogueMarkerResult> {
  if (!(await requireAdminSession())) {
    return { ok: false, error: 'not authorized.' }
  }

  const latRaw = formData.get('latitude')
  const lngRaw = formData.get('longitude')
  const textRaw = formData.get('marker_text')
  const typeRaw = formData.get('marker_type')

  const latitude = typeof latRaw === 'string' ? Number.parseFloat(latRaw) : NaN
  const longitude = typeof lngRaw === 'string' ? Number.parseFloat(lngRaw) : NaN
  const markerText = typeof textRaw === 'string' ? textRaw.trim() : ''
  const markerType: TravelogueMarkerType =
    typeRaw === 'wishes' ? 'wishes' : 'visited'

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { ok: false, error: 'latitude must be between -90 and 90.' }
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { ok: false, error: 'longitude must be between -180 and 180.' }
  }
  if (!markerText) {
    return { ok: false, error: 'marker text is required.' }
  }
  if (markerText.length > 4000) {
    return { ok: false, error: 'marker text is too long (max 4000 characters).' }
  }

  const supabase = createServiceRoleSupabase()
  if (!supabase) {
    return { ok: false, error: 'supabase service role is not configured (SUPABASE_SERVICE_ROLE_KEY).' }
  }

  const { error } = await supabase.from('travelogue_markers').insert({
    latitude,
    longitude,
    marker_text: markerText,
    marker_type: markerType,
  })

  if (error) {
    console.error('addTravelogueMarkerAction:', error)
    return { ok: false, error: error.message || 'could not save marker.' }
  }

  return { ok: true }
}

