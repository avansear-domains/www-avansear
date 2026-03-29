import { fetchTravelogueMarkersPublic } from 'lib/travelogue-markers'
import { Navbar } from '../components/nav'
import { TravelogueLegend } from '../components/travelogue-legend'
import { TravelogueMap } from '../components/travelogue-map'

export default async function Page() {
  const markers = await fetchTravelogueMarkersPublic()
  let visitedCount = 0
  let wishesCount = 0
  for (const m of markers) {
    if (m.marker_type === 'wishes') wishesCount += 1
    else visitedCount += 1
  }

  return (
    <div className="relative min-h-[100dvh] w-full">
      <Navbar variant="floating" />
      <TravelogueLegend visitedCount={visitedCount} wishesCount={wishesCount} />
      <TravelogueMap />
    </div>
  )
}
