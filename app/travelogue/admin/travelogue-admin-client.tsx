'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { addTravelogueMarkerAction } from './actions'

/** Split `latitude, longitude` on the first comma (handles negative values). */
function parseLatLongCombined(raw: string): { lat: number; lng: number } | null {
  const t = raw.trim()
  if (!t) return null
  const comma = t.indexOf(',')
  if (comma === -1) return null
  const lat = Number.parseFloat(t.slice(0, comma).trim())
  const lng = Number.parseFloat(t.slice(comma + 1).trim())
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

type Props = {
  initialAuthenticated: boolean
  mapPassConfigured: boolean
  supabaseServiceConfigured: boolean
}

export function TravelogueAdminClient({
  initialAuthenticated,
  mapPassConfigured,
  supabaseServiceConfigured,
}: Props) {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(initialAuthenticated)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginPending, setLoginPending] = useState(false)

  const [latLongCombined, setLatLongCombined] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [markerText, setMarkerText] = useState('')
  const [markerType, setMarkerType] = useState<'visited' | 'wishes'>('visited')
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginPending(true)
    try {
      const res = await fetch('/api/travelogue/admin/login', {
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
    await fetch('/api/travelogue/admin/logout', { method: 'POST' })
    setAuthenticated(false)
    router.refresh()
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormMessage(null)

    let finalLat: string
    let finalLng: string
    const combined = latLongCombined.trim()
    if (combined) {
      const parsed = parseLatLongCombined(combined)
      if (!parsed) {
        setFormMessage('invalid lat/long. use: latitude, longitude (comma between the two numbers).')
        return
      }
      finalLat = String(parsed.lat)
      finalLng = String(parsed.lng)
    } else {
      if (!lat.trim() || !lng.trim()) {
        setFormMessage('enter latitude and longitude, or fill the combined lat/long field.')
        return
      }
      finalLat = lat.trim()
      finalLng = lng.trim()
    }

    const fd = new FormData()
    fd.set('latitude', finalLat)
    fd.set('longitude', finalLng)
    fd.set('marker_text', markerText)
    fd.set('marker_type', markerType)
    startTransition(async () => {
      const result = await addTravelogueMarkerAction(fd)
      if (result.ok) {
        setFormMessage('marker added.')
        setLatLongCombined('')
        setLat('')
        setLng('')
        setMarkerText('')
        setMarkerType('visited')
      } else {
        setFormMessage(result.error)
      }
    })
  }

  if (!mapPassConfigured) {
    return (
      <p className="text-sm lowercase text-[var(--color-dark)]/80 dark:text-[var(--color-light)]/80">
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
    <div className="mt-6 flex max-w-md flex-col gap-8 lowercase">
      {!supabaseServiceConfigured ? (
        <p className="text-sm lowercase text-amber-800 dark:text-amber-200">
          add <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to your server environment so new markers
          can be inserted. the public map still reads markers with the anon key.
        </p>
      ) : null}

      <form onSubmit={handleAdd} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">lat / long</span>
          <input
            type="text"
            inputMode="decimal"
            name="lat_long_combined"
            value={latLongCombined}
            onChange={(e) => setLatLongCombined(e.target.value)}
            onBlur={() => {
              const p = parseLatLongCombined(latLongCombined)
              if (p) {
                setLat(String(p.lat))
                setLng(String(p.lng))
              }
            }}
            placeholder="latitude, longitude — e.g. 64.1466, -21.9426"
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
          />
          <span className="text-xs lowercase text-[var(--color-dark)]/65 dark:text-[var(--color-light)]/65">
            comma separates latitude and longitude. if you fill this, it overrides the fields below.
          </span>
        </label>
        <p className="text-xs font-medium lowercase text-[var(--color-dark)]/70 dark:text-[var(--color-light)]/70">
          or separately:
        </p>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">latitude</span>
          <input
            type="text"
            inputMode="decimal"
            name="latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 64.1466"
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">longitude</span>
          <input
            type="text"
            inputMode="decimal"
            name="longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. -21.9426"
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">marker type</span>
          <select
            name="marker_type"
            value={markerType}
            onChange={(e) => setMarkerType(e.target.value === 'wishes' ? 'wishes' : 'visited')}
            className="normal-case rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
          >
            <option value="visited">visited (dot)</option>
            <option value="wishes">wish (star)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-[var(--color-dark)] lowercase dark:text-[var(--color-light)]">marker text (popup)</span>
          <textarea
            name="marker_text"
            value={markerText}
            onChange={(e) => setMarkerText(e.target.value)}
            placeholder="shown when someone opens the pin"
            rows={4}
            className="normal-case resize-y rounded border border-[var(--color-dark)]/20 bg-[var(--color-light)] px-3 py-2 text-[var(--color-dark)] dark:border-[var(--color-light)]/20 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
            required
          />
        </label>
        {formMessage ? (
          <p
            className={`text-sm lowercase ${formMessage === 'marker added.' ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            role="status"
          >
            {formMessage}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isPending || !supabaseServiceConfigured}
          className="w-fit rounded border border-[var(--color-dark)]/20 px-3 py-2 text-sm font-medium text-[var(--color-dark)] hover:bg-[var(--color-dark)]/5 dark:border-[var(--color-light)]/20 dark:text-[var(--color-light)] dark:hover:bg-[var(--color-light)]/10 disabled:opacity-50"
        >
          {isPending ? 'adding…' : 'add marker'}
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
