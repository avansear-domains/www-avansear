import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FEED_ADMIN_COOKIE, verifyFeedAdminSessionToken } from 'lib/feed-admin-session'
import { isWorkerUploadConfigured, uploadFileViaWorker } from 'lib/cloudflare-worker-upload'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(FEED_ADMIN_COOKIE)?.value
  const authorized = verifyFeedAdminSessionToken(token)
  if (!authorized) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!isWorkerUploadConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Worker upload not configured. Set CLOUDFLARE_WORKER_URL.',
      },
      { status: 503 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'file is required.' }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'empty file.' }, { status: 400 })
  }

  if (file.size > 25 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: 'max file size is 25MB.' }, { status: 400 })
  }

  try {
    const uploaded = await uploadFileViaWorker(file)
    return NextResponse.json({ ok: true, ...uploaded })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'upload failed' },
      { status: 500 }
    )
  }
}
