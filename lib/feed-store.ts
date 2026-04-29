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
const FEED_ITEMS_OBJECT_KEY = 'feed/items.json'

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

function getWorkerUrl(): string | null {
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL
  return workerUrl ? workerUrl.replace(/\/$/, '') : null
}

async function getFeedItemsFromWorker(workerUrl: string): Promise<FeedItem[]> {
  const response = await fetch(`${workerUrl}/${FEED_ITEMS_OBJECT_KEY}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (response.status === 404) {
    return DEFAULT_FEED_ITEMS
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch feed items from worker: HTTP ${response.status}`)
  }

  const parsed = (await response.json()) as FeedItem[]
  return parsed
}

async function writeFeedItemsToWorker(workerUrl: string, items: FeedItem[]): Promise<void> {
  const response = await fetch(`${workerUrl}/${FEED_ITEMS_OBJECT_KEY}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(items, null, 2),
  })

  if (!response.ok) {
    throw new Error(`Failed to write feed items to worker: HTTP ${response.status}`)
  }
}

export async function getFeedItems(): Promise<FeedItem[]> {
  const workerUrl = getWorkerUrl()
  if (workerUrl) {
    const parsed = await getFeedItemsFromWorker(workerUrl)
    return parsed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }

  await ensureFeedDataFile()
  const raw = await readFile(FEED_DATA_FILE, 'utf8')
  const parsed = JSON.parse(raw) as FeedItem[]
  return parsed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export async function addFeedItem(input: NewFeedItemInput): Promise<FeedItem> {
  const workerUrl = getWorkerUrl()
  if (workerUrl) {
    const items = await getFeedItemsFromWorker(workerUrl)
    const item: FeedItem = {
      id: randomUUID(),
      type: input.type,
      title: input.title.trim(),
      body: input.body?.trim() || undefined,
      mediaUrl: input.mediaUrl?.trim() || undefined,
      linkUrl: input.linkUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    await writeFeedItemsToWorker(workerUrl, [item, ...items])
    return item
  }

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
  const workerUrl = getWorkerUrl()
  if (workerUrl) {
    const items = await getFeedItemsFromWorker(workerUrl)
    const next = items.filter((item) => item.id !== id)
    if (next.length === items.length) {
      return false
    }
    await writeFeedItemsToWorker(workerUrl, next)
    return true
  }

  const items = await getFeedItems()
  const next = items.filter((item) => item.id !== id)
  if (next.length === items.length) {
    return false
  }
  await writeFile(FEED_DATA_FILE, JSON.stringify(next, null, 2), 'utf8')
  return true
}
