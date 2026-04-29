import { cookies } from 'next/headers'
import { FEED_ADMIN_COOKIE, verifyFeedAdminSessionToken } from 'lib/feed-admin-session'
import { getFeedItems } from 'lib/feed-store'
import { FeedAppClient } from './feed-app-client'

export const dynamic = 'force-dynamic'

export default async function FeedAppPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(FEED_ADMIN_COOKIE)?.value
  const canManage = verifyFeedAdminSessionToken(token)
  const items = await getFeedItems()
  return <FeedAppClient items={items} canManage={canManage} />
}
