import { AnimatedHeading } from '../components/animated-heading'
import { Card } from '../components/Card'

export default function Page() {
  return (
    <section>
      <div className="title-spacing">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          beyond
        </AnimatedHeading>
        <p>
          stuff i wanna include here over time
        </p>
      </div>
      <Card
        title="music"
        description="my fav songs :D"
        href="/musix"
        variant='arrow-right'
      />
    </section>
  )
}
