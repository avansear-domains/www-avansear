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
  const viewportRef = useRef<HTMLDivElement>(null)
  const hasItems = feedItems.length > 0
  const repeated = useMemo(
    () => (hasItems ? [...feedItems, ...feedItems, ...feedItems] : []),
    [feedItems, hasItems]
  )

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

  async function handleDelete(id: string) {
    if (!canManage || deletingId) return
    setDeletingId(id)
    try {
      const response = await fetch('/api/feed/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean }
      if (!response.ok || !data.ok) {
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
            {canManage ? (
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                type="button"
              >
                {deletingId === item.id ? 'deleting...' : 'delete'}
              </button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
