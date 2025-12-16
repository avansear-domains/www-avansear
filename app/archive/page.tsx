import { ArchivePosts } from '../components/archive-posts'
import { AnimatedHeading } from '../components/animated-heading'

export const metadata = {
  title: 'ar(t)chives',
  description: 'archived projects',
}

export default function Page() {
  return (
    <section>
      <div className="mb-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          ar(t)chives
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">
          archived projects
        </p>
      </div>
      <ArchivePosts />
    </section>
  )
}

