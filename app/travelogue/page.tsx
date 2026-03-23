import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { AnimatedHeading } from '../components/animated-heading'
import { TravelogueGlobe3D } from './TravelogueGlobe3D'
import type { TravelogueMarker } from './TravelogueGlobe'

export const dynamic = 'force-dynamic'

function parseMarkers(markdown: string): TravelogueMarker[] {
  const markers: TravelogueMarker[] = []

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith('#')) continue

    // Expected format: name | type | lat | long
    if (!line.includes('|')) continue

    const parts = line.split('|').map((p) => p.trim())
    if (parts.length < 4) continue

    const [name, rawType, rawLat, rawLng] = parts
    const lat = Number.parseFloat(rawLat)
    const lng = Number.parseFloat(rawLng)
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue

    const typeLower = rawType.toLowerCase()
    const type: TravelogueMarker['type'] = typeLower.includes('home') ? 'home' : 'visited'

    markers.push({ name, type, lat, lng })
  }

  return markers
}

export default async function Page() {
  const markersPath = path.join(process.cwd(), 'app/travelogue/markers.md')
  const markdown = await readFile(markersPath, 'utf8')
  const markers = parseMarkers(markdown)

  return (
    <section>
      <div className="title-spacing">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          travelogue
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">where i’ve been</p>
      </div>

      <TravelogueGlobe3D markers={markers} />
    </section>
  )
}
