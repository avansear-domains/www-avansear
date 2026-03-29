import { NextResponse } from 'next/server'
import { fetchTravelogueMarkersPublic } from 'lib/travelogue-markers'

export async function GET() {
  const markers = await fetchTravelogueMarkersPublic()
  return NextResponse.json(markers)
}
