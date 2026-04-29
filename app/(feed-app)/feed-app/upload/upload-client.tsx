'use client'

import { useMemo, useState } from 'react'
import styles from './upload.module.css'

const FEED_TYPES = ['text', 'photo', 'project', 'meme', 'sticker', 'gif', 'song', 'link'] as const

type FeedType = (typeof FEED_TYPES)[number]
type ApiResponse = { ok?: boolean; error?: string }
type UploadResponse = ApiResponse & { url?: string; objectKey?: string }

interface UploadClientProps {
  initialAuthenticated: boolean
  customPassConfigured: boolean
}

export function UploadClient({
  initialAuthenticated,
  customPassConfigured,
}: UploadClientProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [type, setType] = useState<FeedType>('text')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && (body.trim() || mediaUrl.trim() || linkUrl.trim())
  }, [body, linkUrl, mediaUrl, title])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/feed/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await response.json()) as ApiResponse
      if (!response.ok || !data.ok) {
        setMessage(data.error || 'login failed')
        return
      }
      setAuthenticated(true)
      setPassword('')
      setMessage('authenticated.')
    } catch {
      setMessage('network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setLoading(true)
    setMessage('')
    try {
      await fetch('/api/feed/admin/logout', { method: 'POST' })
      setAuthenticated(false)
      setMessage('logged out.')
    } catch {
      setMessage('logout failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/feed/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title, body, mediaUrl, linkUrl }),
      })
      const data = (await response.json()) as ApiResponse
      if (!response.ok || !data.ok) {
        setMessage(data.error || 'could not create item')
        return
      }
      setTitle('')
      setBody('')
      setMediaUrl('')
      setLinkUrl('')
      setMessage('added to feed.')
    } catch {
      setMessage('network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload() {
    if (!selectedFile) {
      setMessage('pick a file first')
      return
    }

    setUploadingFile(true)
    setMessage('')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      const response = await fetch('/api/feed/upload', {
        method: 'POST',
        body: formData,
      })
      const data = (await response.json()) as UploadResponse
      if (!response.ok || !data.ok) {
        setMessage(data.error || 'upload failed')
        return
      }
      const uploadedUrl = data.url || ''
      setMediaUrl(uploadedUrl)

      if (type === 'photo') {
        const fallbackTitle =
          selectedFile.name.replace(/\.[^/.]+$/, '').trim() || `photo ${new Date().toLocaleString()}`
        const response = await fetch('/api/feed/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'photo',
            title: title.trim() || fallbackTitle,
            body,
            mediaUrl: uploadedUrl,
            linkUrl,
          }),
        })
        const postData = (await response.json()) as ApiResponse
        if (!response.ok || !postData.ok) {
          setMessage(postData.error || 'uploaded, but auto-post failed')
          return
        }
        setTitle('')
        setBody('')
        setMediaUrl('')
        setLinkUrl('')
        setMessage('uploaded and posted to feed.')
      } else {
        setMessage('uploaded to cloudflare bucket.')
      }

      setSelectedFile(null)
    } catch {
      setMessage('upload failed')
    } finally {
      setUploadingFile(false)
    }
  }

  return (
    <main className={styles.root}>
      <section className={styles.shell}>
        <h1 className={styles.title}>upload to feed</h1>
        <p className={styles.subtitle}>
          Add whatever feels like you. This writes directly to your `/feed-app` stream.
        </p>

        {!customPassConfigured ? (
          <p className={styles.error}>`CUSTOM_PASS` is not configured on the server.</p>
        ) : !authenticated ? (
          <form className={styles.form} onSubmit={handleLogin}>
            <label htmlFor="password">enter custom pass</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
            />
            <button disabled={loading} type="submit">
              {loading ? 'checking...' : 'unlock upload'}
            </button>
          </form>
        ) : (
          <>
            <form className={styles.form} onSubmit={handleCreate}>
              <label htmlFor="type">type</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as FeedType)}>
                {FEED_TYPES.map((feedType) => (
                  <option key={feedType} value={feedType}>
                    {feedType}
                  </option>
                ))}
              </select>

              <label htmlFor="title">title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="short title"
                required
              />

              <label htmlFor="body">text (optional)</label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="caption / note / thought"
                rows={4}
              />

              <label htmlFor="mediaUrl">media URL (optional)</label>
              <input
                id="mediaUrl"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
              />

              <label htmlFor="fileUpload">or upload file to cloudflare bucket</label>
              <input
                id="fileUpload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={loading || uploadingFile || !selectedFile}
              >
                {uploadingFile ? 'uploading...' : 'upload file'}
              </button>

              <label htmlFor="linkUrl">external link URL (optional)</label>
              <input
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
              />

              {type !== 'photo' ? (
                <button disabled={loading || !canSubmit} type="submit">
                  {loading ? 'saving...' : 'add to feed'}
                </button>
              ) : null}
            </form>
            <button className={styles.logoutButton} onClick={handleLogout} disabled={loading}>
              log out
            </button>
          </>
        )}

        {message ? <p className={styles.message}>{message}</p> : null}
      </section>
    </main>
  )
}
