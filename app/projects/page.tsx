import { ProjectPosts } from '../components/project-posts'
import { AnimatedHeading } from '../components/animated-heading'
import Link from 'next/link'

export const metadata = {
  title: 'projects',
  description: 'cool shit i did',
}

export default function Page() {
  return (
    <section>
      <div className="mb-8">
        <AnimatedHeading className="font-semibold text-2xl tracking-tighter">
          projects
        </AnimatedHeading>
        <p className="text-[var(--color-dark)] dark:text-[var(--color-light)]">
          cool shit i did
        </p>
      </div>
      <div>
        <ProjectPosts />
        <Link className="flex flex-col space-y-1 mb-4 border-[var(--color-light-80)]" href="/archive">
          <div className="w-full flex flex-row space-x-2 items-center">
            <p className="text-[var(--color-light-80)] w-fit tracking-tighter whitespace-nowrap flex-shrink-0">
              ar(t)chives
            </p>
            <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter truncate">
              archived projects
            </p>
          </div>
        </Link>
      </div>
    </section>
  )
} 
