import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createTravelogueAdminSessionToken, TRAVELOGUE_ADMIN_COOKIE } from 'lib/travelogue-admin-session'

function passwordsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return diff === 0
}

export async function POST(request: Request) {
  const expected = process.env.CUSTOM_PASS
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'server is not configured (CUSTOM_PASS).' }, { status: 503 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON.' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (!passwordsEqual(password, expected)) {
    return NextResponse.json({ ok: false, error: 'incorrect password.' }, { status: 401 })
  }

  const token = createTravelogueAdminSessionToken()
  if (!token) {
    return NextResponse.json({ ok: false, error: 'could not create session.' }, { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set(TRAVELOGUE_ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return NextResponse.json({ ok: true })
}
