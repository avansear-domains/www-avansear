'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TravelogueMarker } from './TravelogueGlobe'

type TravelogueGlobePoint = TravelogueMarker & { id: string }

export function TravelogueGlobe3D({ markers }: { markers: TravelogueMarker[] }) {
  const [GlobeImpl, setGlobeImpl] = useState<any>(null)
  const globeRef = useRef<any>(null)

  const [accentColor, setAccentColor] = useState<string>('var(--color-light)')
  const [popup, setPopup] = useState<{ name: string; left: number; top: number } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [globeSize, setGlobeSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 420,
  })

  useEffect(() => {
    let cancelled = false
    import('react-globe.gl').then((mod) => {
      if (cancelled) return
      setGlobeImpl(mod.default ?? mod)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const updateColors = () => {
      const styles = getComputedStyle(document.documentElement)
      setAccentColor(styles.getPropertyValue('--color-light').trim() || '#eeeeee')
    }
    updateColors()

    const observer = new MutationObserver(() => updateColors())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const resize = () => {
      const rect = el.getBoundingClientRect()
      setGlobeSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      })
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [containerRef])

  const pointsData = useMemo<TravelogueGlobePoint[]>(() => {
    return markers.map((m, idx) => ({
      ...m,
      id: `${m.type}-${m.name}-${idx}`,
    }))
  }, [markers])

  const homeMarkers = useMemo(() => {
    return markers.filter((m) => m.type === 'home')
  }, [markers])

  const handlePointClick = (point: TravelogueGlobePoint, event: any) => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const clientX = event?.clientX
    const clientY = event?.clientY

    if (typeof clientX !== 'number' || typeof clientY !== 'number') {
      setPopup({ name: point.name, left: rect.width / 2, top: rect.height / 2 })
      return
    }

    setPopup({
      name: point.name,
      left: clientX - rect.left,
      top: clientY - rect.top,
    })

    try {
      globeRef.current?.pointOfView?.(
        { lat: point.lat, lng: point.lng, altitude: point.type === 'home' ? 2.0 : 2.25 },
        650,
      )
    } catch {
      // no-op
    }
  }

  const focusOnMarker = (marker: TravelogueMarker) => {
    setPopup({ name: marker.name, left: 0, top: 0 })
    try {
      globeRef.current?.pointOfView?.(
        { lat: marker.lat, lng: marker.lng, altitude: marker.type === 'home' ? 2.0 : 2.25 },
        800,
      )
    } catch {
      // no-op
    }
  }

  if (!GlobeImpl) {
    return (
      <div
        ref={containerRef}
        className="relative travelogue-globe rounded-xl bg-transparent overflow-visible"
        style={{ height: 420, width: '100%' }}
      >
        <div className="absolute inset-0" />
      </div>
    )
  }

  const Globe = GlobeImpl

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="travelogue-globe rounded-xl bg-transparent overflow-visible"
        style={{
          height: 600,
          width: '100%',
          // Keeps the globe feeling "floating".
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
        }}
      >
        <Globe
          ref={globeRef}
          width={globeSize.width}
          height={globeSize.height}
          globeOffset={[0, -Math.round(globeSize.height * 0.120)]}
          backgroundColor="rgba(0,0,0,0)"
          rendererConfig={{ antialias: true, alpha: true }}
          enablePointerInteraction
          globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe@2.27.0/example/img/earth-blue-marble.jpg"
          bumpImageUrl="https://cdn.jsdelivr.net/npm/three-globe@2.27.0/example/img/earth-topology.png"
          showAtmosphere
          atmosphereColor={accentColor}
          atmosphereAltitude={0.1}
          showGraticules={false}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: TravelogueGlobePoint) => accentColor}
          // Keep home cylinders tiny (star visuals are HTML), but preserve clickability.
          pointAltitude={(d: TravelogueGlobePoint) => (d.type === 'home' ? 0.02 : 0.1)}
          pointRadius={(d: TravelogueGlobePoint) => (d.type === 'home' ? 0.12 : 0.28)}
          pointResolution={18}
          pointsMerge={false}
          pointLabel={(d: TravelogueGlobePoint) => d.name}
          onPointClick={(point: TravelogueGlobePoint, event: any) => handlePointClick(point, event)}

          htmlElementsData={homeMarkers}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.07}
          // Render star glyphs above the globe surface.
          htmlElement={(d: TravelogueMarker) => {
            const el = document.createElement('div')
            el.textContent = '★'
            el.style.color = accentColor
            el.style.fontSize = '18px'
            el.style.fontWeight = '900'
            el.style.textShadow = `0 0 12px ${accentColor}`
            el.style.transform = 'translate(-50%, -50%)'
            el.style.pointerEvents = 'none'
            return el
          }}
        />

        {popup && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: popup.left,
              top: popup.top,
              transform: 'translate(-50%, -120%)',
              padding: '0.45rem 0.7rem',
              borderRadius: '0.75rem',
              background: 'color-mix(in srgb, var(--color-dark) 70%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-light) 30%, transparent)',
              color: 'var(--color-light)',
              backdropFilter: 'blur(10px)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              // hide "list focus" placeholder popup until a real click positions it
              opacity: popup.left === 0 && popup.top === 0 ? 0 : 1,
            }}
          >
            {popup.name}
          </div>
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
                className="flex flex-col space-y-1 mb-4 w-full text-left"
                onClick={() => focusOnMarker(m)}
              >
                <div className="w-full flex flex-row space-x-2">
                  <p className="text-[var(--color-light)]/80 w-fit tabular-nums flex-shrink-0">{num}</p>
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

