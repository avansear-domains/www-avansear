'use client'

import { useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { marked } from 'marked'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function todayString(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

type Props = {
  initialAuthenticated: boolean
  writingsPassConfigured: boolean
  githubConfigured: boolean
}

export function WritingsAdminClient({ initialAuthenticated, writingsPassConfigured, githubConfigured }: Props) {
  const router = useRouter()

  // auth state
  const [authenticated, setAuthenticated] = useState(initialAuthenticated)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginPending, setLoginPending] = useState(false)

  // editor state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [publishedAt, setPublishedAt] = useState(todayString())
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [publishPending, setPublishPending] = useState(false)
  const [publishMessage, setPublishMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const previewHtml = useMemo(() => marked.parse(content) as string, [content])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginPending(true)
    try {
      const res = await fetch('/api/writings/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setLoginError(data.error ?? 'login failed.')
        return
      }
      setPassword('')
      setAuthenticated(true)
      router.refresh()
    } catch {
      setLoginError('network error.')
    } finally {
      setLoginPending(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/writings/admin/logout', { method: 'POST' })
    setAuthenticated(false)
    router.refresh()
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setPublishMessage(null)
    setPublishPending(true)
    try {
      const res = await fetch('/api/writings/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, publishedAt, summary, content }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setPublishMessage({ ok: false, text: data.error ?? 'publish failed.' })
        return
      }
      setPublishMessage({ ok: true, text: 'post committed to github. vercel will deploy in ~30–60 seconds.' })
      setTitle('')
      setSlug('')
      setSlugManual(false)
      setSummary('')
      setContent('')
      setPublishedAt(todayString())
    } catch {
      setPublishMessage({ ok: false, text: 'network error.' })
    } finally {
      setPublishPending(false)
    }
  }

  if (!writingsPassConfigured) {
    return (
      <p className="mt-6 text-sm lowercase text-[var(--color-dark)]/80 dark:text-[var(--color-light)]/80">
        set <code className="font-mono">CUSTOM_PASS</code> in the server environment to use this page.
      </p>
    )
  }

  if (!authenticated) {
    return (
      <form onSubmit={handleLogin} className="mt-6 flex max-w-sm flex-col gap-3 lowercase">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
            required
          />
        </label>
        {loginError ? (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {loginError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loginPending}
          className="rounded border border-[var(--color-dark)]/20 px-3 py-2 text-sm font-medium text-[var(--color-dark)] hover:bg-[var(--color-dark)]/5 dark:border-[var(--color-light)]/20 dark:text-[var(--color-light)] dark:hover:bg-[var(--color-light)]/10 disabled:opacity-50"
        >
          {loginPending ? 'signing in…' : 'sign in'}
        </button>
      </form>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-6 lowercase">
      {!githubConfigured ? (
        <p className="text-sm lowercase text-amber-800 dark:text-amber-200">
          add <code className="font-mono">GITHUB_TOKEN</code> and <code className="font-mono">GITHUB_REPO</code> to
          your server environment to enable publishing.
        </p>
      ) : null}

      <form onSubmit={handlePublish} className="flex flex-col gap-4">
        {/* title */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (!slugManual) setSlug(slugify(e.target.value))
            }}
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
            required
          />
        </label>

        {/* slug */}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setSlugManual(true)
            }}
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 font-mono text-sm text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
            required
          />
          {slug ? (
            <span className="font-mono text-xs text-[var(--color-dark)]/50 dark:text-[var(--color-light)]/50">
              app/writings/posts/{slug}.mdx
            </span>
          ) : null}
        </label>

        {/* date + summary row */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <label className="flex flex-col gap-1 text-sm sm:w-48">
            <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">date</span>
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
              required
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">summary</span>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="one-line description shown in the post list"
              className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
              required
            />
          </label>
        </div>

        {/* content + preview */}
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-[var(--color-dark)] dark:text-[var(--color-light)]">content (markdown)</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="normal-case resize-y rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 font-mono text-sm leading-relaxed text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
              required
            />
          </label>

          <div className="flex flex-1 flex-col gap-1 text-sm">
            <span className="text-[var(--color-dark)]/60 dark:text-[var(--color-light)]/60">preview</span>
            <div
              className="prose prose-sm min-h-48 overflow-auto rounded border border-[var(--color-dark)]/10 px-4 py-3 text-[var(--color-dark)] dark:border-[var(--color-light)]/10 dark:text-[var(--color-light)]"
              // marked output is sanitized server-side; this is admin-only so XSS risk is self-inflicted
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>

        {publishMessage ? (
          <p
            className={`text-sm lowercase ${publishMessage.ok ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            role="status"
          >
            {publishMessage.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={publishPending || !githubConfigured}
          className="w-fit rounded border border-[var(--color-dark)]/20 px-4 py-2 text-sm font-medium text-[var(--color-dark)] hover:bg-[var(--color-dark)]/5 dark:border-[var(--color-light)]/20 dark:text-[var(--color-light)] dark:hover:bg-[var(--color-light)]/10 disabled:opacity-50"
        >
          {publishPending ? 'publishing…' : 'publish'}
        </button>
      </form>

      <button
        type="button"
        onClick={() => void handleLogout()}
        className="w-fit text-sm text-[var(--color-dark)]/70 underline dark:text-[var(--color-light)]/70"
      >
        sign out
      </button>
    </div>
  )
}
