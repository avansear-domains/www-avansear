import { ProjectPosts } from '../components/project-posts'
import { AnimatedHeading } from '../components/animated-heading'

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
      <ProjectPosts />
    </section>
  )
} 
