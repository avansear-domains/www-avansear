import Link from 'next/link'
import { AnimatedHeading } from '../components/animated-heading'

export default function Page() {
  return (
    <section>
      <div className="title-spacing">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          beyond
        </AnimatedHeading>
        <p> stuff i wanna include here over time </p>
      </div>
      <p className="text-sm">
        this is my <Link href="/musix" className="page-link">music</Link> history
      </p>
    </section>
  )
}
