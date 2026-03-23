'use client'

import 'leaflet/dist/leaflet.css'
import '../../styles/leaflet-map.css'

import type { CSSProperties } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

export type TravelogueMarkerType = 'home' | 'visited'

export type TravelogueMarker = {
  name: string
  type: TravelogueMarkerType
  lat: number
  lng: number
}

function FitMarkersBounds({
  markers,
  leaflet,
  useMap,
}: {
  markers: TravelogueMarker[]
  leaflet: typeof import('leaflet') | null
  useMap: (() => any) | null
}) {
  const map = useMap ? useMap() : null

  useEffect(() => {
    if (!map || !leaflet) return
    if (!markers.length) return

    const bounds = leaflet.latLngBounds(markers.map((m) => [m.lat, m.lng]))
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 5 })
  }, [map, leaflet, markers])

  return null
}

function getMarkerIcon(
  leaflet: typeof import('leaflet'),
  type: TravelogueMarkerType
) {
  const common = {
    className: 'travelogue-marker',
    iconSize: [24, 24] as [number, number],
    iconAnchor: [12, 24] as [number, number],
    popupAnchor: [0, -22] as [number, number],
  }

  if (type === 'home') {
    return leaflet.divIcon({
      ...common,
      html: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="12,2.5 15.1,9 22.3,9.7 16.9,14 18.6,21 12,17.4 5.4,21 7.1,14 1.7,9.7 8.9,9"
            stroke="var(--map-marker)"
            stroke-width="2"
            fill="var(--map-marker)"
            opacity="0.14"
          />
        </svg>
      `,
    })
  }

  return leaflet.divIcon({
    ...common,
    html: `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 22s8-4.6 8-12a8 8 0 1 0-16 0c0 7.4 8 12 8 12Z"
          stroke="var(--map-marker)"
          stroke-width="2"
        />
        <circle cx="12" cy="10" r="3" fill="var(--map-marker)" opacity="0.22" />
      </svg>
    `,
  })
}

export function TravelogueMap({ markers }: { markers: TravelogueMarker[] }) {
  const [mapWaterColor, setMapWaterColor] = useState('var(--color-dark)')

  useEffect(() => {
    const parseHex = (hex: string) => {
      const normalized = hex.trim().replace('#', '')
      if (normalized.length !== 6) return null
      const r = Number.parseInt(normalized.slice(0, 2), 16)
      const g = Number.parseInt(normalized.slice(2, 4), 16)
      const b = Number.parseInt(normalized.slice(4, 6), 16)
      if (![r, g, b].every((v) => Number.isFinite(v))) return null
      return { r, g, b }
    }

    const parseRgb = (rgb: string) => {
      const match = rgb.match(/rgb(a)?\(([^)]+)\)/)
      if (!match) return null
      const parts = match[2]
        .split(',')
        .map((p) => p.trim())
        .slice(0, 3)
      const nums = parts.map((p) =>
        p.endsWith('%') ? (Number.parseFloat(p) * 255) / 100 : Number.parseFloat(p),
      )
      const [r, g, b] = nums
      if (![r, g, b].every((v) => Number.isFinite(v))) return null
      return { r, g, b }
    }

    const luminance = (rgb: { r: number; g: number; b: number }) => {
      return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255
    }

    const pickWaterTint = () => {
      const styles = getComputedStyle(document.documentElement)
      const colorDark = styles.getPropertyValue('--color-dark').trim()
      const colorLight = styles.getPropertyValue('--color-light').trim()

      const darkRgb = colorDark.startsWith('#') ? parseHex(colorDark) : parseRgb(colorDark)
      const lightRgb = colorLight.startsWith('#') ? parseHex(colorLight) : parseRgb(colorLight)
      if (!darkRgb || !lightRgb) return

      // Choose the darker swatch so it feels like the theme's "accent shade":
      // - theme1: dark=red, light=near-white => water tint becomes red
      // - theme4: light=blue, dark=pink-ish but very light => water tint becomes blue
      const tint = luminance(darkRgb) < luminance(lightRgb) ? colorDark : colorLight
      setMapWaterColor(tint)
    }

    pickWaterTint()
    const observer = new MutationObserver(() => pickWaterTint())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const [leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null)
  const [reactLeaflet, setReactLeaflet] = useState<typeof import('react-leaflet') | null>(null)
  const mapRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    import('leaflet').then((mod) => {
      if (cancelled) return
      setLeaflet(mod)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    import('react-leaflet').then((mod) => {
      if (cancelled) return
      setReactLeaflet(mod)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const MarkerAny = reactLeaflet?.Marker as any
  const PopupAny = reactLeaflet?.Popup as any
  const MapContainer = reactLeaflet?.MapContainer as any
  const TileLayer = reactLeaflet?.TileLayer as any

  const markerIcons = useMemo(() => {
    if (!leaflet) return null
    return {
      home: getMarkerIcon(leaflet, 'home'),
      visited: getMarkerIcon(leaflet, 'visited'),
    }
  }, [leaflet])

  const lightTilesUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png'

  const initialBounds = useMemo(
    () => [[-90, -180], [90, 180]] as [[number, number], [number, number]],
    [],
  )

  const mapProps = useMemo(
    () => ({
      bounds: initialBounds,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: false,
      preferCanvas: true,
      style: { height: 420, width: '100%' },
    }),
    [initialBounds],
  )

  const zoomToMarker = (marker: TravelogueMarker) => {
    const map = mapRef.current
    if (!map) return

    const latLng: [number, number] = [marker.lat, marker.lng]
    const targetZoom = 6
    const options = { animate: true, duration: 0.6 }

    if (typeof map.invalidateSize === 'function') {
      map.invalidateSize()
    }

    try {
      // Always set a deterministic view change first.
      if (typeof map.setView === 'function') {
        map.setView(latLng, targetZoom, options)
      }
      // Then attempt animated fly.
      if (typeof map.flyTo === 'function') {
        map.flyTo(latLng, targetZoom, options)
      }
    } catch {
      // No-op: we don't want clicks to break the page.
    }
  }

  return (
    <div>
      <div
      className="travelogue-map rounded-xl border border-[var(--color-light)]/80 bg-[var(--color-dark)]/20 overflow-hidden"
        style={
          {
          // Markers should always use the theme accent (color-light).
          '--map-marker': 'var(--color-light)',
          '--map-water': mapWaterColor,
          } as CSSProperties
        }
      >
        {MapContainer && TileLayer && MarkerAny && PopupAny ? (
          <MapContainer
            {...(mapProps as any)}
            ref={(map: any) => {
              mapRef.current = map
              setIsMapReady(Boolean(map))
            }}
            // Some react-leaflet versions don’t wire ref reliably under dynamic imports.
            // whenCreated is kept as a fallback for runtime.
            whenCreated={(map: any) => {
              mapRef.current = map
              setIsMapReady(Boolean(map))
            }}
          >
            <TileLayer url={lightTilesUrl} />
            <FitMarkersBounds markers={markers} leaflet={leaflet} useMap={reactLeaflet?.useMap as any} />

            {markerIcons &&
              markers.map((m, idx) => (
                <MarkerAny
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${m.type}-${m.name}-${idx}`}
                  position={[m.lat, m.lng]}
                  icon={m.type === 'home' ? markerIcons.home : markerIcons.visited}
                >
                  <PopupAny closeButton={false} autoPan={false}>
                    {m.name}
                  </PopupAny>
                </MarkerAny>
              ))}
          </MapContainer>
        ) : (
          <div style={{ height: 420 }} />
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">visited archive</h2>
        <div>
          {markers.map((m, idx) => {
            const num = String(idx).padStart(2, '0')
            return (
              <button
                key={`${m.type}-${m.name}-${idx}`}
                type="button"
                disabled={!isMapReady}
                className={`flex flex-col space-y-1 mb-4 w-full text-left transition-opacity ${
                  isMapReady ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => zoomToMarker(m)}
              >
                <div className="w-full flex flex-row space-x-2">
                  <p className="text-[var(--color-light)]/80 w-fit tabular-nums flex-shrink-0">
                    {num}
                  </p>
                  <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tight">
                    {m.name}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

