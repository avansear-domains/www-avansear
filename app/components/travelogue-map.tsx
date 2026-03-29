'use client'

import { useEffect, useRef, useState } from 'react'
import { MapManager, type MapMarkerProperties } from '@arenarium/maps'
import '@arenarium/maps/style.css'
import { MaplibreDarkStyle, MaplibreLightStyle, MaplibreProvider } from '@arenarium/maps-integration-maplibre'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const TOKEN = process.env.NEXT_PUBLIC_ARENARIUM_TOKEN

/**
 * OpenMapTiles Positron / Dark Matter (Carto-style visualization basemaps).
 * @see https://github.com/openmaptiles/positron-gl-style
 * @see https://github.com/openmaptiles/dark-matter-gl-style
 */
const OMT_POSITRON_STYLE_JSON =
  'https://raw.githubusercontent.com/openmaptiles/positron-gl-style/master/style.json'
const OMT_DARK_MATTER_STYLE_JSON =
  'https://raw.githubusercontent.com/openmaptiles/dark-matter-gl-style/master/style.json'

/** OpenMapTiles-compatible planet tiles (same host as Arenarium’s bundled styles; no API key). */
const OPENFREEMAP_PLANET = 'https://tiles.openfreemap.org/planet'
const OPENFREEMAP_GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'

/**
 * Upstream styles use MapTiler `tiles.json?key={key}`; swap to OpenFreeMap so the map works
 * without `NEXT_PUBLIC_MAPTILER_KEY`. Sprites stay on openmaptiles.github.io.
 */
function patchOmtStyleForOpenFreeMap(style: StyleSpecification): StyleSpecification {
  const out = structuredClone(style)
  const sources = out.sources
  if (sources && typeof sources === 'object' && 'openmaptiles' in sources) {
    const omt = sources.openmaptiles
    if (omt && typeof omt === 'object' && 'type' in omt && omt.type === 'vector' && 'url' in omt) {
      ;(omt as { url: string }).url = OPENFREEMAP_PLANET
    }
  }
  out.glyphs = OPENFREEMAP_GLYPHS
  return out
}

/**
 * OpenMapTiles styles use `place_country_*`; Arenarium fallbacks use `label_country_*`.
 * Hide all other symbol layers (cities, roads, water names, oneway arrows, etc.).
 * Country names only appear from this zoom upward (world view stays clean).
 */
const MIN_ZOOM_COUNTRY_LABELS = 4

function patchBasemapLabels(style: StyleSpecification): StyleSpecification {
  const out = structuredClone(style)
  for (const layer of out.layers) {
    if (layer.type !== 'symbol') continue
    const id = layer.id
    const isCountry =
      id.startsWith('place_country_') || id.startsWith('label_country_')

    if (isCountry) {
      const l = layer as { minzoom?: number }
      l.minzoom = l.minzoom != null ? Math.max(l.minzoom, MIN_ZOOM_COUNTRY_LABELS) : MIN_ZOOM_COUNTRY_LABELS
      if (!layer.layout) {
        ;(layer as { layout: { visibility: string } }).layout = { visibility: 'visible' }
      } else {
        Object.assign(layer.layout, { visibility: 'visible' })
      }
    } else if (!layer.layout) {
      ;(layer as { layout: { visibility: string } }).layout = { visibility: 'none' }
    } else {
      Object.assign(layer.layout, { visibility: 'none' })
    }
  }
  return out
}

async function loadOpenMapTilesBasemap(appearance: 'light' | 'dark'): Promise<StyleSpecification> {
  const url = appearance === 'dark' ? OMT_DARK_MATTER_STYLE_JSON : OMT_POSITRON_STYLE_JSON
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Map style HTTP ${res.status}`)
  const json = (await res.json()) as StyleSpecification
  return patchBasemapLabels(patchOmtStyleForOpenFreeMap(json))
}

/** Resolved from `--theme-appearance` in theme CSS (light | dark). */
function getThemeAppearance(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  const v = getComputedStyle(document.documentElement).getPropertyValue('--theme-appearance').trim()
  return v === 'dark' ? 'dark' : 'light'
}

const FALLBACK_DARK = '#171717'
const FALLBACK_LIGHT = '#eeeeee'

/** Arenarium requires `#` + exactly 6 or 8 hex digits (no shorthand). */
function normalizeHexForMarkers(input: string, fallback: string): string {
  const raw = input.trim()
  if (!raw) return fallback

  if (raw.startsWith('#')) {
    let h = raw.slice(1)
    if (!/^[0-9a-fA-F]+$/.test(h)) return fallback
    if (h.length === 3) {
      h = h.split('').map((c) => c + c).join('')
    } else if (h.length === 4) {
      h = h.slice(0, 3).split('').map((c) => c + c).join('')
    } else if (h.length === 8) {
      h = h.slice(0, 6)
    }
    if (h.length === 6) return `#${h.toLowerCase()}`
    return fallback
  }

  const m = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (m) {
    const r = Number(m[1])
    const g = Number(m[2])
    const b = Number(m[3])
    return (
      '#' +
      [r, g, b]
        .map((x) => Math.min(255, Math.max(0, x)).toString(16).padStart(2, '0'))
        .join('')
    )
  }
  return fallback
}

/** Read a theme color as #rrggbb for Arenarium hex validation. */
function cssHexVar(name: '--color-dark' | '--color-light'): string {
  if (typeof document === 'undefined') {
    return name === '--color-light' ? FALLBACK_LIGHT : FALLBACK_DARK
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const fallback = name === '--color-light' ? FALLBACK_LIGHT : FALLBACK_DARK
  return normalizeHexForMarkers(raw, fallback)
}

function shadowFilter(appearance: 'light' | 'dark'): string {
  return appearance === 'dark'
    ? 'drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.45))'
    : 'drop-shadow(0px 2px 6px rgba(0, 0, 0, 0.2))'
}

function tooltipShadow(appearance: 'light' | 'dark'): string {
  return appearance === 'dark'
    ? 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.35))'
    : 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.15))'
}

function getDotMarkerElement(fillHex: string, strokeHex: string): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:auto;'
  const dot = document.createElement('div')
  dot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${fillHex};border:2px solid ${strokeHex};box-shadow:0 1px 3px rgba(0,0,0,0.35);`
  wrap.appendChild(dot)
  return wrap
}

/** Star glyph for “wishes” markers (similar footprint to the dot). */
function getStarMarkerElement(fillHex: string, strokeHex: string): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText =
    'width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:auto;'
  const star = document.createElement('span')
  star.setAttribute('aria-hidden', 'true')
  star.textContent = '★'
  star.style.cssText = `font-size:18px;line-height:1;color:${fillHex};-webkit-text-stroke:0.6px ${strokeHex};text-shadow:0 1px 3px rgba(0,0,0,0.35);`
  wrap.appendChild(star)
  return wrap
}

function getMarkerGlyphElement(kind: 'visited' | 'wishes', fillHex: string, strokeHex: string): HTMLElement {
  return kind === 'wishes' ? getStarMarkerElement(fillHex, strokeHex) : getDotMarkerElement(fillHex, strokeHex)
}

function normalizeMarkerType(raw: unknown): 'visited' | 'wishes' {
  return raw === 'wishes' ? 'wishes' : 'visited'
}

/** Simple card popup: note + coordinates (legible fixed layout; dimensions set below). */
function getMarkerPopupElement(markerText: string, lat: number, lng: number, textHex: string): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = `box-sizing:border-box;width:100%;height:100%;padding:12px 14px;font:14px/1.45 system-ui,sans-serif;color:${textHex};display:flex;flex-direction:column;justify-content:center;gap:6px;overflow:auto;`
  const title = document.createElement('div')
  title.style.fontWeight = '600'
  title.style.whiteSpace = 'pre-wrap'
  title.style.wordBreak = 'break-word'
  title.style.textTransform = 'none'
  title.textContent = markerText
  const coords = document.createElement('div')
  coords.style.cssText = 'font-size:12px;opacity:0.75;line-height:1.4;'
  coords.textContent = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
  el.appendChild(title)
  el.appendChild(coords)
  return el
}

type TravelogueMarkerApiRow = {
  id: string
  latitude: number
  longitude: number
  marker_text: string
  marker_type?: string
  sort_rank: number
}

async function fetchTravelogueMarkerRows(): Promise<TravelogueMarkerApiRow[]> {
  try {
    const res = await fetch('/api/travelogue/markers')
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []
    return data as TravelogueMarkerApiRow[]
  } catch {
    return []
  }
}

function buildMarkersFromRows(rows: TravelogueMarkerApiRow[]): MapMarkerProperties[] {
  const appearance = getThemeAppearance()
  const dark = cssHexVar('--color-dark')
  const light = cssHexVar('--color-light')

  return rows.map((s) => {
    const kind = normalizeMarkerType(s.marker_type)
    const glyph = getMarkerGlyphElement(kind, dark, light)
    return {
      id: s.id,
      rank: s.sort_rank,
      lat: s.latitude,
      lng: s.longitude,
      tooltip: {
        element: glyph,
        dimensions: { width: 28, height: 28, padding: 6 },
        style: {
          background: light,
          radius: 999,
          filter: tooltipShadow(appearance),
        },
      },
      pin: {
        element: glyph,
        dimensions: { radius: 7, stroke: 2 },
        style: {
          background: dark,
          stroke: light,
        },
      },
      popup: {
        element: getMarkerPopupElement(s.marker_text, s.latitude, s.longitude, dark),
        dimensions: { width: 240, height: 100, padding: 8 },
        style: {
          background: light,
          filter: shadowFilter(appearance),
          radius: 12,
        },
      },
    }
  })
}

/** MapLibre reads container size at init; if layout shifts afterward, the canvas stays wrong until `resize()`. */
function attachMapResize(map: maplibregl.Map, container: HTMLElement) {
  const resize = () => {
    try {
      map.resize()
    } catch {
      /* ignore */
    }
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(resize)
  })

  map.once('load', resize)

  const ro = new ResizeObserver(resize)
  ro.observe(container)
  window.addEventListener('resize', resize)

  return () => {
    ro.disconnect()
    window.removeEventListener('resize', resize)
  }
}

export function TravelogueMap() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!TOKEN) return

    const el = containerRef.current
    if (!el) return
    const container: HTMLDivElement = el

    let cancelled = false
    let map: maplibregl.Map | null = null
    let manager: MapManager | null = null
    let detachResize: (() => void) | null = null
    let themeObserver: MutationObserver | null = null
    let themeDebounce: number | null = null
    /** Bumps when `data-theme` changes so an in-flight init is abandoned. */
    let mapInitGeneration = 0

    function disposeMap() {
      if (themeDebounce !== null) {
        cancelAnimationFrame(themeDebounce)
        themeDebounce = null
      }
      themeObserver?.disconnect()
      themeObserver = null
      detachResize?.()
      detachResize = null
      try {
        manager?.clear()
      } catch {
        /* ignore */
      }
      manager = null
      try {
        map?.remove()
      } catch {
        /* ignore */
      }
      map = null
    }

    function scheduleReloadMapForTheme() {
      if (themeDebounce !== null) cancelAnimationFrame(themeDebounce)
      themeDebounce = requestAnimationFrame(() => {
        themeDebounce = null
        void initMap()
      })
    }

    async function initMap() {
      if (!TOKEN) return
      const generation = ++mapInitGeneration
      disposeMap()
      if (cancelled) return

      try {
        const initialAppearance = getThemeAppearance()
        let basemapStyle: StyleSpecification
        try {
          basemapStyle = await loadOpenMapTilesBasemap(initialAppearance)
        } catch (e) {
          console.warn('OpenMapTiles basemap fetch failed, using bundled fallback style.', e)
          basemapStyle = patchBasemapLabels(
            structuredClone(
              initialAppearance === 'dark' ? MaplibreDarkStyle : MaplibreLightStyle,
            ) as StyleSpecification,
          )
        }

        if (cancelled || generation !== mapInitGeneration) {
          return
        }

        const markerRows = await fetchTravelogueMarkerRows()
        if (cancelled || generation !== mapInitGeneration) {
          return
        }

        let centerLng = 10
        let centerLat = 35
        let zoom = 2
        if (markerRows.length > 0) {
          const n = markerRows.length
          centerLng = markerRows.reduce((a, r) => a + r.longitude, 0) / n
          centerLat = markerRows.reduce((a, r) => a + r.latitude, 0) / n
          zoom = markerRows.length === 1 ? 5 : 2.5
        }

        const maplibreProvider = new MaplibreProvider(maplibregl.Map, maplibregl.Marker, {
          container,
          style: basemapStyle,
          center: [centerLng, centerLat],
          zoom,
          attributionControl: false,
        })

        map = maplibreProvider.getMap()
        detachResize = attachMapResize(map, container)

        const mapManager = await MapManager.create(TOKEN, maplibreProvider, {
          events: {
            error: (message, err) => {
              console.error('Arenarium map:', message, err)
            },
          },
        })

        if (cancelled || generation !== mapInitGeneration) {
          disposeMap()
          return
        }

        manager = mapManager
        await mapManager.updateMarkers(buildMarkersFromRows(markerRows))
        map?.resize()

        if (cancelled || generation !== mapInitGeneration) {
          disposeMap()
          return
        }

        themeObserver = new MutationObserver(() => {
          scheduleReloadMapForTheme()
        })
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        })
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('init')
        disposeMap()
      }
    }

    void initMap()

    return () => {
      cancelled = true
      disposeMap()
    }
  }, [])

  if (!TOKEN) {
    return (
      <div
        className="fixed inset-0 z-[10] flex items-center justify-center bg-[var(--color-light)] px-4 text-center text-sm lowercase text-[var(--color-dark)]/80 dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]/80"
        role="status"
      >
        set{' '}
        <code className="font-mono text-[var(--color-dark)] dark:text-[var(--color-light)]">
          NEXT_PUBLIC_ARENARIUM_TOKEN
        </code>{' '}
        in your environment to load the map.
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 z-[10] flex items-center justify-center bg-[var(--color-light)] px-4 text-center text-sm lowercase text-[var(--color-dark)] dark:bg-[var(--color-dark)] dark:text-[var(--color-light)]"
        role="alert"
      >
        the map could not be initialized. check the browser console for details.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10] h-[100dvh] w-full"
      aria-label="travel map"
    />
  )
}
