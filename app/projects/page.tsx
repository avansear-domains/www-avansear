import { ProjectPosts } from '../components/project-posts'
import { AnimatedHeading } from '../components/animated-heading'

export const metadata = {
  title: 'Projects',
  description: 'Check out my projects.',
}

export default function Page() {
  return (
    <section>
      <AnimatedHeading className="font-semibold text-2xl mb-8 tracking-tighter">
        projects
      </AnimatedHeading>
      <ProjectPosts />
    </section>
  )
} 
