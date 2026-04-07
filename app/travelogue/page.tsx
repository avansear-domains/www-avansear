import { Navbar } from '../components/nav'
import { TravelogueLegendDynamic } from '../components/travelogue-legend-dynamic'
import { TravelogueMap } from '../components/travelogue-map'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <div className="relative min-h-[100dvh] w-full">
      <Navbar variant="floating" />
      <TravelogueLegendDynamic />
      <TravelogueMap />
    </div>
  )
}
