import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyWritingsAdminSessionToken, WRITINGS_ADMIN_COOKIE } from 'lib/writings-admin-session'

const SLUG_RE = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(WRITINGS_ADMIN_COOKIE)?.value
  if (!verifyWritingsAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: 'not authenticated.' }, { status: 401 })
  }

  const githubToken = process.env.GITHUB_TOKEN
  const githubRepo = process.env.GITHUB_REPO
  if (!githubToken || !githubRepo) {
    return NextResponse.json(
      { ok: false, error: 'server is not configured (GITHUB_TOKEN or GITHUB_REPO missing).' },
      { status: 503 },
    )
  }

  let body: { title?: string; slug?: string; publishedAt?: string; summary?: string; content?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON.' }, { status: 400 })
  }

  const { title, slug, publishedAt, summary, content } = body

  if (!title?.trim()) return NextResponse.json({ ok: false, error: 'title is required.' }, { status: 400 })
  if (!slug?.trim()) return NextResponse.json({ ok: false, error: 'slug is required.' }, { status: 400 })
  if (!SLUG_RE.test(slug.trim()))
    return NextResponse.json(
      { ok: false, error: 'slug must be lowercase letters, numbers, hyphens, or underscores only.' },
      { status: 400 },
    )
  if (!publishedAt?.trim() || !DATE_RE.test(publishedAt.trim()))
    return NextResponse.json({ ok: false, error: 'publishedAt must be YYYY-MM-DD.' }, { status: 400 })
  if (!summary?.trim()) return NextResponse.json({ ok: false, error: 'summary is required.' }, { status: 400 })
  if (!content?.trim()) return NextResponse.json({ ok: false, error: 'content is required.' }, { status: 400 })

  const mdx = `---\ntitle: '${title.trim().replace(/'/g, "\\'")}'\npublishedAt: '${publishedAt.trim()}'\nsummary: '${summary.trim().replace(/'/g, "\\'")}'\n---\n\n${content.trim()}\n`

  const filePath = `app/writings/posts/${slug.trim()}.mdx`
  const url = `https://api.github.com/repos/${githubRepo}/contents/${filePath}`

  const ghRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      message: `add writing: ${title.trim()}`,
      content: Buffer.from(mdx, 'utf8').toString('base64'),
      branch: 'main',
    }),
  })

  if (ghRes.status === 201) {
    return NextResponse.json({ ok: true })
  }

  let ghError = 'github api error.'
  try {
    const ghBody = (await ghRes.json()) as { message?: string }
    if (ghBody.message) {
      if (ghRes.status === 422) {
        ghError = `a post with the slug "${slug.trim()}" already exists.`
      } else {
        ghError = ghBody.message
      }
    }
  } catch {
    // ignore parse error
  }

  return NextResponse.json({ ok: false, error: ghError }, { status: ghRes.status >= 500 ? 502 : ghRes.status })
}
