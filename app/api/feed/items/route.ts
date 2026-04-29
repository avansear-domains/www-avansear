import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { addFeedItem, deleteFeedItemById, getFeedItems, type FeedItemType } from 'lib/feed-store'
import { FEED_ADMIN_COOKIE, verifyFeedAdminSessionToken } from 'lib/feed-admin-session'

export const runtime = 'nodejs'

const ALLOWED_TYPES: FeedItemType[] = [
  'text',
  'photo',
  'project',
  'meme',
  'sticker',
  'gif',
  'song',
  'link',
]

export async function GET() {
  const items = await getFeedItems()
  return NextResponse.json({ ok: true, items })
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(FEED_ADMIN_COOKIE)?.value
  const authorized = verifyFeedAdminSessionToken(token)
  if (!authorized) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: {
    type?: FeedItemType
    title?: string
    body?: string
    mediaUrl?: string
    linkUrl?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON.' }, { status: 400 })
  }

  const type = body.type
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const textBody = typeof body.body === 'string' ? body.body.trim() : ''
  const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl.trim() : ''
  const linkUrl = typeof body.linkUrl === 'string' ? body.linkUrl.trim() : ''

  if (!type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: 'invalid type.' }, { status: 400 })
  }

  if (!title) {
    return NextResponse.json({ ok: false, error: 'title is required.' }, { status: 400 })
  }

  if (!textBody && !mediaUrl && !linkUrl) {
    return NextResponse.json(
      { ok: false, error: 'provide text, media URL, or link URL.' },
      { status: 400 }
    )
  }

  const created = await addFeedItem({
    type,
    title,
    body: textBody,
    mediaUrl,
    linkUrl,
  })

  return NextResponse.json({ ok: true, item: created })
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(FEED_ADMIN_COOKIE)?.value
  const authorized = verifyFeedAdminSessionToken(token)
  if (!authorized) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  let body: { id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON.' }, { status: 400 })
  }

  const id = typeof body.id === 'string' ? body.id.trim() : ''
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id is required.' }, { status: 400 })
  }

  const deleted = await deleteFeedItemById(id)
  if (!deleted) {
    return NextResponse.json({ ok: false, error: 'item not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
