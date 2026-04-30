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
      <Card
        title="travelogue"
        description={
          <>
            made using{' '}
            <a
              href="https://arenarium.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              arenarium maps
            </a>
          </>
        }
        href="/travelogue"
        variant='arrow-right'
        className="mt-4"
      />
      <Card
        title="ze feed"
        description="my life in a feed :>"
        href="https://feed.avansear.com"
        variant='arrow-right'
      />
    </section>
  )
}
