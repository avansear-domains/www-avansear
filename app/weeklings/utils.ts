import fs from 'fs'
import path from 'path'

export interface WeeklingPost {
  slug: string
  title: string
  description: string
  publishedAt: string
}

const weeklingsDirectory = path.join(process.cwd(), 'app/weeklings/posts')

export function getWeeklingSlugs(): string[] {
  return ['musix']
}

export function formatDate(date: string, includeRelative = false) {
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let fullDate = targetDate
    .toLocaleString('en-us', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toLowerCase()

  if (!includeRelative) {
    return fullDate
  }

  if (typeof window === 'undefined') {
    return fullDate
  }

  let currentDate = new Date()
  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  return `${fullDate} (${formattedDate})`
}

export function getWeeklingPost(slug: string): WeeklingPost | null {
  const weeklingPosts: Record<string, WeeklingPost> = {
    musix: {
      slug: 'musix',
      title: 'musix',
      description: 'music archive and playlists',
      publishedAt: '2024-12-15'
    }
  }

  return weeklingPosts[slug] || null
}

export function getAllWeeklingPosts(): WeeklingPost[] {
  const slugs = getWeeklingSlugs()
  return slugs.map(slug => getWeeklingPost(slug)!).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
