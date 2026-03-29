import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { TRAVELOGUE_ADMIN_COOKIE } from 'lib/travelogue-admin-session'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(TRAVELOGUE_ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return NextResponse.json({ ok: true })
}
