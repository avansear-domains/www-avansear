import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export type FeedItemType =
  | 'text'
  | 'photo'
  | 'project'
  | 'meme'
  | 'sticker'
  | 'gif'
  | 'song'
  | 'link'

export interface FeedItem {
  id: string
  type: FeedItemType
  title: string
  body?: string
  mediaUrl?: string
  linkUrl?: string
  createdAt: string
}

export interface NewFeedItemInput {
  type: FeedItemType
  title: string
  body?: string
  mediaUrl?: string
  linkUrl?: string
}

const FEED_DATA_FILE = path.join(process.cwd(), 'data', 'feed-items.json')

const DEFAULT_FEED_ITEMS: FeedItem[] = [
  {
    id: 'seed-1',
    type: 'text',
    title: 'new feed app unlocked',
    body: 'This is my personal scroll zone. A bunch of things that feel like me.',
    createdAt: new Date().toISOString(),
  },
]

async function ensureFeedDataFile() {
  const dataDir = path.dirname(FEED_DATA_FILE)
  await mkdir(dataDir, { recursive: true })
  try {
    await readFile(FEED_DATA_FILE, 'utf8')
  } catch {
    await writeFile(FEED_DATA_FILE, JSON.stringify(DEFAULT_FEED_ITEMS, null, 2), 'utf8')
  }
}

export async function getFeedItems(): Promise<FeedItem[]> {
  await ensureFeedDataFile()
  const raw = await readFile(FEED_DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw) as FeedItem[]
  return parsed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export async function addFeedItem(input: NewFeedItemInput): Promise<FeedItem> {
  const items = await getFeedItems()
  const item: FeedItem = {
    id: randomUUID(),
    type: input.type,
    title: input.title.trim(),
    body: input.body?.trim() || undefined,
    mediaUrl: input.mediaUrl?.trim() || undefined,
    linkUrl: input.linkUrl?.trim() || undefined,
    createdAt: new Date().toISOString(),
  }
  const next = [item, ...items]
  await writeFile(FEED_DATA_FILE, JSON.stringify(next, null, 2), 'utf8')
  return item
}

export async function deleteFeedItemById(id: string): Promise<boolean> {
  const items = await getFeedItems()
  const next = items.filter((item) => item.id !== id)
  if (next.length === items.length) {
    return false
  }
  await writeFile(FEED_DATA_FILE, JSON.stringify(next, null, 2), 'utf8')
  return true
}
