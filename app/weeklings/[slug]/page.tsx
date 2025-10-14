import { notFound } from 'next/navigation'
import { getWeeklingPost, getWeeklingSlugs } from '../utils'

interface WeeklingPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const slugs = getWeeklingSlugs()
  return slugs.map((slug) => ({
    slug: slug,
  }))
}

export default async function WeeklingPage({ params }: WeeklingPageProps) {
  const resolvedParams = await params
  const post = getWeeklingPost(resolvedParams.slug)

  if (!post) {
    notFound()
  }

  if (post.slug === 'musix') {
    // Import and render the musix component
    const MusixPage = require('../../musix/page').default
    return <MusixPage />
  }

  return null
}
