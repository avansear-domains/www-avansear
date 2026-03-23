'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export type TravelogueMarkerType = 'home' | 'visited'

export type TravelogueMarker = {
  name: string
  type: TravelogueMarkerType
  lat: number
  lng: number
}

type Vec3 = { x: number; y: number; z: number }

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

function latLngToVec3(latDeg: number, lngDeg: number): Vec3 {
  // Convert to a unit sphere point.
  // lat: -90..90, lng: -180..180
  const lat = degToRad(latDeg)
  const lng = degToRad(lngDeg)

  const clat = Math.cos(lat)
  return {
    x: clat * Math.cos(lng),
    y: Math.sin(lat),
    z: clat * Math.sin(lng),
  }
}

function rotateX(v: Vec3, a: number): Vec3 {
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return {
    x: v.x,
    y: v.y * cos - v.z * sin,
    z: v.y * sin + v.z * cos,
  }
}

function rotateY(v: Vec3, a: number): Vec3 {
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return {
    x: v.x * cos + v.z * sin,
    y: v.y,
    z: -v.x * sin + v.z * cos,
  }
}

function projectToScreen(v: Vec3, cx: number, cy: number, r: number, zoom: number) {
  const front = v.z > 0
  return {
    front,
    sx: cx + v.x * r * zoom,
    sy: cy - v.y * r * zoom,
  }
}

function focusRotationsForMarker(marker: TravelogueMarker) {
  // Find rotY/rotX such that the marker ends up at the front-center of the globe.
  // We use the same rotation order as we render: rotY then rotX.
  const v = latLngToVec3(marker.lat, marker.lng)

  // After rotY(theta): x' = x*cos + z*sin
  // We want x' ~= 0, so tan(theta) = -x/z => theta = atan2(-x, z)
  const rotY = Math.atan2(-v.x, v.z)
  const vY = rotateY(v, rotY)
  // After rotX(psi): y' = y*cos - z'*sin = 0 => tan(psi) = y / z'
  const rotX = Math.atan2(vY.y, vY.z)

  return { rotX, rotY }
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const spikes = 5
  const outerR = size
  const innerR = size * 0.45
  let rot = (Math.PI / 2) * 3
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(x, y - outerR)
  for (let i = 0; i < spikes; i += 1) {
    ctx.lineTo(x + Math.cos(rot) * outerR, y + Math.sin(rot) * outerR)
    rot += step
    ctx.lineTo(x + Math.cos(rot) * innerR, y + Math.sin(rot) * innerR)
    rot += step
  }
  ctx.closePath()
}

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  // Minimal pin: circle + small stem.
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x, y + r * 0.9)
  ctx.lineTo(x, y + r * 1.65)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(x, y + r * 1.9, r * 0.18, 0, Math.PI * 2)
  ctx.fill()
}

export function TravelogueGlobe({ markers }: { markers: TravelogueMarker[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [accentColor, setAccentColor] = useState('var(--color-light)')
  const [textColor, setTextColor] = useState('var(--color-dark)')

  const [rotX, setRotX] = useState(-0.2)
  const [rotY, setRotY] = useState(0.4)
  const rotRef = useRef({ rotX: -0.2, rotY: 0.4 })

  const [zoom, setZoom] = useState(1.0)

  const [activeMarker, setActiveMarker] = useState<TravelogueMarker | null>(null)
  const [popupPos, setPopupPos] = useState<{ left: number; top: number } | null>(null)

  // Keep ref in sync for animation.
  useEffect(() => {
    rotRef.current = { rotX, rotY }
  }, [rotX, rotY])

  useEffect(() => {
    const updateThemeColors = () => {
      const styles = getComputedStyle(document.documentElement)
      setAccentColor(styles.getPropertyValue('--color-light').trim() || 'var(--color-light)')
      setTextColor(styles.getPropertyValue('--color-dark').trim() || 'var(--color-dark)')
    }
    updateThemeColors()

    const observer = new MutationObserver(() => updateThemeColors())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = containerRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return

    const resize = () => {
      const rect = el.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    }

    resize()

    const ro = new ResizeObserver(() => resize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const projected = useMemo(() => {
    const el = containerRef.current
    const canvas = canvasRef.current
    if (!el || !canvas) return []

    const rect = el.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    const r = Math.min(rect.width, rect.height) * 0.42

    return markers.map((m) => {
      const v0 = latLngToVec3(m.lat, m.lng)
      const v1 = rotateY(v0, rotY)
      const v2 = rotateX(v1, rotX)
      const p = projectToScreen(v2, cx, cy, r, zoom)
      return { marker: m, ...p, z: v2.z }
    })
  }, [markers, rotX, rotY, zoom])

  useEffect(() => {
    if (!activeMarker) return
    const found = projected.find(
      (p) =>
        p.marker.name === activeMarker.name &&
        p.marker.type === activeMarker.type &&
        p.marker.lat === activeMarker.lat &&
        p.marker.lng === activeMarker.lng,
    )
    if (!found || !found.front) {
      setPopupPos(null)
      return
    }
    setPopupPos({ left: found.sx, top: found.sy })
  }, [activeMarker, projected])

  useEffect(() => {
    const canvas = canvasRef.current
    const el = containerRef.current
    if (!canvas || !el) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = el.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const cx = rect.width / 2
    const cy = rect.height / 2
    const r = Math.min(rect.width, rect.height) * 0.42

    // Reset transform every draw to avoid cumulative scaling.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Ocean sphere (fixed blue-green "normal" globe).
    const grd = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.2, cx, cy, r)
    grd.addColorStop(0, '#37e3c1')
    grd.addColorStop(0.35, '#1aa38f')
    grd.addColorStop(0.7, '#0a5c6a')
    grd.addColorStop(1, '#073342')

    // Clip to globe.
    ctx.beginPath()
    ctx.arc(cx, cy, r * zoom, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Fake land masses: subtle noise-like blobs (very light).
    ctx.globalAlpha = 0.14
    ctx.fillStyle = '#0f7a5a'
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2
      const rr = r * zoom * (0.15 + (i % 5) * 0.12)
      const x = cx + Math.cos(angle + 0.2) * rr
      const y = cy + Math.sin(angle - 0.1) * rr * 0.6
      ctx.beginPath()
      ctx.ellipse(x, y, rr * 0.55, rr * 0.28, angle, 0, Math.PI * 2)
      ctx.fill()
    }

    // Shadow to add depth.
    ctx.globalAlpha = 0.35
    ctx.globalCompositeOperation = 'multiply'
    const shade = ctx.createRadialGradient(cx + r * 0.25, cy + r * 0.15, r * 0.1, cx, cy, r * zoom)
    shade.addColorStop(0, '#000000')
    shade.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = shade
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Atmosphere ring.
    ctx.beginPath()
    ctx.arc(cx, cy, r * zoom + 1.2, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(120, 255, 220, 0.35)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw pins on top.
    for (const item of projected) {
      if (!item.front) continue

      const x = item.sx
      const y = item.sy
      const isHome = item.marker.type === 'home'

      // Keep pin sizing reasonable.
      const pinR = Math.max(4, Math.min(9, 6 * (0.95 + (zoom - 1) * 0.35)))

      ctx.fillStyle = accentColor
      ctx.strokeStyle = accentColor
      ctx.lineWidth = 2
      ctx.shadowColor = accentColor
      ctx.shadowBlur = 10

      if (isHome) {
        ctx.translate(x, y)
        ctx.fillStyle = accentColor
        ctx.strokeStyle = accentColor
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.95
        drawStar(ctx, 0, 0, pinR * 0.95)
        ctx.fill()
        ctx.stroke()
      } else {
        ctx.globalAlpha = 0.95
        ctx.fillStyle = accentColor
        ctx.strokeStyle = accentColor
        drawPin(ctx, x, y, pinR * 0.55)
      }
    }
  }, [accentColor, projected, zoom])

  const [dragState, setDragState] = useState<{ x: number; y: number; startRotX: number; startRotY: number } | null>(null)

  useEffect(() => {
    if (!dragState) return

    const onMove = (e: PointerEvent) => {
      if (!dragState) return
      const dx = e.clientX - dragState.x
      const dy = e.clientY - dragState.y
      const nextRotY = dragState.startRotY + dx * 0.006
      const nextRotX = dragState.startRotX + dy * 0.006
      setRotY(nextRotY)
      // clamp latitude to avoid flipping.
      setRotX(Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, nextRotX)))
    }

    const onUp = () => setDragState(null)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragState])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Prevent page scroll while zooming the globe.
    e.preventDefault()
    const delta = e.deltaY
    const factor = delta > 0 ? 0.92 : 1.08
    setZoom((z) => Math.max(0.75, Math.min(1.85, z * factor)))
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    let best: { marker: TravelogueMarker; dist2: number; sx: number; sy: number } | null = null
    const threshold = 18

    for (const item of projected) {
      if (!item.front) continue
      const dx = mx - item.sx
      const dy = my - item.sy
      const dist2 = dx * dx + dy * dy
      if (dist2 > threshold * threshold) continue
      if (!best || dist2 < best.dist2) {
        best = { marker: item.marker, dist2, sx: item.sx, sy: item.sy }
      }
    }

    if (!best) {
      setActiveMarker(null)
      setPopupPos(null)
      return
    }

    setActiveMarker(best.marker)
    setPopupPos({
      left: best.sx,
      top: best.sy,
    })
  }

  const animateFocus = (targetRotX: number, targetRotY: number) => {
    const start = { ...rotRef.current }
    const duration = 650
    const t0 = performance.now()

    const ease = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const k = ease(t)
      const nextRotY = start.rotY + (targetRotY - start.rotY) * k
      const nextRotX = start.rotX + (targetRotX - start.rotX) * k
      setRotY(nextRotY)
      setRotX(nextRotX)
      if (t < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }

  const focusOnMarker = (marker: TravelogueMarker) => {
    const { rotX: tx, rotY: ty } = focusRotationsForMarker(marker)
    // Bring marker closer for readability.
    setActiveMarker(marker)
    setZoom(1.25)
    animateFocus(tx, ty)
  }

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onClick={handleClick}
        onPointerDown={(e) => {
          // Drag to rotate
          const bounds = containerRef.current?.getBoundingClientRect()
          if (!bounds) return
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
          setDragState({
            x: e.clientX,
            y: e.clientY,
            startRotX: rotRef.current.rotX,
            startRotY: rotRef.current.rotY,
          })
        }}
        className="relative travelogue-map rounded-xl border border-[var(--color-light)]/80 bg-transparent overflow-hidden"
        style={{
          // Keeps the globe feeling "floating" inside the card.
          height: 420,
          touchAction: 'none',
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {activeMarker && popupPos && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: popupPos.left,
              top: popupPos.top,
              transform: 'translate(-50%, -110%)',
              padding: '0.45rem 0.7rem',
              borderRadius: '0.75rem',
              background: `color-mix(in srgb, var(--color-dark) 70%, transparent)`,
              border: '1px solid color-mix(in srgb, var(--color-light) 30%, transparent)',
              color: 'var(--color-light)',
              backdropFilter: 'blur(10px)',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {activeMarker.name}
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

