import { notFound } from 'next/navigation'
import { getWeeklingPost, getWeeklingSlugs } from '../utils'
import { SimpleWhiteboard } from '../../components/simple-whiteboard'

interface WeeklingPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = getWeeklingSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

export default function WeeklingPage({ params }: WeeklingPageProps) {
  const post = getWeeklingPost(params.slug)

  if (!post) {
    notFound()
  }

  if (post.slug === 'musix') {
    // Import and render the musix component
    const MusixPage = require('../../musix/page').default
    return <MusixPage />
  }

  if (post.slug === 'whiteboard') {
    return (
      <section>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{post.title}</h1>
          <p className="text-sm opacity-70">
            {post.description}
          </p>
        </div>
        
        <div className="w-80 h-80 mx-auto">
          <SimpleWhiteboard />
        </div>
      </section>
    )
  }

  return null
}
