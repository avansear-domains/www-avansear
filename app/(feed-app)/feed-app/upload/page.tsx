import { cookies } from 'next/headers'
import { FEED_ADMIN_COOKIE, verifyFeedAdminSessionToken } from 'lib/feed-admin-session'
import { UploadClient } from './upload-client'

export const dynamic = 'force-dynamic'

export default async function FeedUploadPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get(FEED_ADMIN_COOKIE)?.value
  const initialAuthenticated = verifyFeedAdminSessionToken(token)
  const customPassConfigured = Boolean(process.env.CUSTOM_PASS)

  return (
    <UploadClient
      initialAuthenticated={initialAuthenticated}
      customPassConfigured={customPassConfigured}
    />
  )
}
