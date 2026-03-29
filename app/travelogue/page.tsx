import { Navbar } from '../components/nav'
import { TravelogueLegend } from '../components/travelogue-legend'
import { TravelogueMap } from '../components/travelogue-map'

export default function Page() {
  return (
    <div className="relative min-h-[100dvh] w-full">
      <Navbar variant="floating" />
      <TravelogueLegend />
      <TravelogueMap />
    </div>
  )
}
