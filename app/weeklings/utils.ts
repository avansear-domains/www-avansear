import { getWeeklingEntries as getArchivedWeeklings } from './archive'

export interface WeeklingEntry {
  week: string
  title: string
  description: string
  url: string
  publishedAt: string
}

export function getWeeklingEntries(): WeeklingEntry[] {
  return getArchivedWeeklings()
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