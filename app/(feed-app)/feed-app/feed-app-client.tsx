'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FeedItem } from 'lib/feed-store'
import styles from './page.module.css'

interface FeedAppClientProps {
  items: FeedItem[]
  canManage: boolean
}

function renderMedia(item: FeedItem) {
  if (item.type === 'song' && item.mediaUrl) {
    return (
      <audio controls className={styles.audio}>
        <source src={item.mediaUrl} />
      </audio>
    )
  }

  if (item.mediaUrl) {
    return <img className={styles.media} src={item.mediaUrl} alt={item.title} loading="lazy" />
  }

  return null
}

export function FeedAppClient({ items, canManage }: FeedAppClientProps) {
  const [feedItems, setFeedItems] = useState(items)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [canDelete, setCanDelete] = useState(canManage)
  const [deleteMessage, setDeleteMessage] = useState('')
  const viewportRef = useRef<HTMLDivElement>(null)
  const hasItems = feedItems.length > 0
  const repeated = useMemo(
    () => (hasItems ? [...feedItems, ...feedItems, ...feedItems] : []),
    [feedItems, hasItems]
  )

  useEffect(() => {
    if (canManage) {
      setCanDelete(true)
      try {
        window.localStorage.setItem('feed-admin-unlocked', 'true')
      } catch {
        // Ignore storage errors.
      }
      return
    }

    try {
      const cached = window.localStorage.getItem('feed-admin-unlocked')
      if (cached === 'true') {
        setCanDelete(true)
      }
    } catch {
      // Ignore storage errors.
    }
  }, [canManage])

  useEffect(() => {
    if (!hasItems || !viewportRef.current) return
    const viewport = viewportRef.current
    const cycleHeight = window.innerHeight * feedItems.length
    viewport.scrollTop = cycleHeight

    const onScroll = () => {
      const current = viewport.scrollTop
      if (current < window.innerHeight * 0.5) {
        viewport.scrollTop = current + cycleHeight
      } else if (current > cycleHeight * 2 + window.innerHeight * 0.5) {
        viewport.scrollTop = current - cycleHeight
      }
    }

    viewport.addEventListener('scroll', onScroll, { passive: true })
    return () => viewport.removeEventListener('scroll', onScroll)
  }, [feedItems.length, hasItems])

  async function ensureDeleteAccess(): Promise<boolean> {
    if (canDelete) return true

    const password = window.prompt('Enter CUSTOM_PASS to enable delete:')
    if (!password) {
      return false
    }

    setDeleteMessage('')
    const response = await fetch('/api/feed/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    if (!response.ok || !data.ok) {
      setDeleteMessage(data.error || 'auth failed')
      return false
    }

    setCanDelete(true)
    setDeleteMessage('delete unlocked for this browser session.')
    try {
      window.localStorage.setItem('feed-admin-unlocked', 'true')
    } catch {
      // Ignore storage errors.
    }
    return true
  }

  async function handleDelete(id: string) {
    if (deletingId) return
    const ok = await ensureDeleteAccess()
    if (!ok) return

    setDeletingId(id)
    try {
      const response = await fetch('/api/feed/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean }
      if (!response.ok || !data.ok) {
        if (response.status === 401) {
          setCanDelete(false)
          try {
            window.localStorage.removeItem('feed-admin-unlocked')
          } catch {
            // Ignore storage errors.
          }
          setDeleteMessage('session expired. enter CUSTOM_PASS again to delete.')
        }
        return
      }
      setFeedItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  if (!hasItems) {
    return (
      <main className={styles.root}>
        <section className={styles.emptyState}>
          <h1>feed app</h1>
          <p>nothing here yet. add your first item at `/feed-app/upload`.</p>
        </section>
      </main>
    )
  }

  return (
    <div className={styles.viewport} ref={viewportRef}>
      {repeated.map((item, index) => (
        <article key={`${item.id}-${index}`} className={styles.slide}>
          <div className={styles.card}>
            <p className={styles.meta}>
              {item.type} · {new Date(item.createdAt).toLocaleDateString()}
            </p>
            <h2 className={styles.title}>{item.title}</h2>
            {item.body ? <p className={styles.body}>{item.body}</p> : null}
            {renderMedia(item)}
            {item.linkUrl ? (
              <a className={styles.link} href={item.linkUrl} target="_blank" rel="noreferrer">
                open link
              </a>
            ) : null}
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              type="button"
            >
              {deletingId === item.id ? 'deleting...' : 'delete'}
            </button>
          </div>
        </article>
      ))}
      {deleteMessage ? <p className={styles.deleteMessage}>{deleteMessage}</p> : null}
    </div>
  )
}
