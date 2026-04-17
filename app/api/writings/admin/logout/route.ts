import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { WRITINGS_ADMIN_COOKIE } from 'lib/writings-admin-session'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(WRITINGS_ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
}
