import { ProjectPosts } from '../components/project-posts'

export const metadata = {
  title: 'Projects',
  description: 'Check out my projects.',
}

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">projects</h1>
      <ProjectPosts />
    </section>
  )
} 
