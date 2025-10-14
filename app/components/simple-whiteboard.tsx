'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface DrawingData {
  x: number
  y: number
  type: 'start' | 'draw' | 'end'
}

interface SimpleWhiteboardProps {
  className?: string
  size?: number
}

export function SimpleWhiteboard({ className = '', size = 300 }: SimpleWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawings, setDrawings] = useState<DrawingData[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDrawings = localStorage.getItem('simple-whiteboard-drawings')
    if (savedDrawings) {
      setDrawings(JSON.parse(savedDrawings))
    }
  }, [])

  // Save data to localStorage whenever drawings change
  useEffect(() => {
    localStorage.setItem('simple-whiteboard-drawings', JSON.stringify(drawings))
  }, [drawings])


  // Draw on canvas
  const draw = useCallback((ctx: CanvasRenderingContext2D, drawing: DrawingData) => {
    // Get computed style values
    const computedStyle = getComputedStyle(document.documentElement)
    const fgColor = computedStyle.getPropertyValue('--color-dark').trim()
    
    ctx.strokeStyle = fgColor
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (drawing.type === 'start') {
      ctx.beginPath()
      ctx.moveTo(drawing.x, drawing.y)
    } else if (drawing.type === 'draw') {
      ctx.lineTo(drawing.x, drawing.y)
      ctx.stroke()
    } else if (drawing.type === 'end') {
      ctx.stroke()
    }
  }, [])

  // Redraw entire canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get computed style values
    const computedStyle = getComputedStyle(document.documentElement)
    const bgColor = computedStyle.getPropertyValue('--color-light').trim()
    
    // Clear canvas with background color (swapped)
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw all drawings
    drawings.forEach(drawing => {
      draw(ctx, drawing)
    })
  }, [drawings, draw])

  // Redraw when drawings change
  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // Listen for theme changes and redraw
  useEffect(() => {
    const handleThemeChange = () => {
      redrawCanvas()
    }

    // Listen for theme changes by watching for data-theme attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          handleThemeChange()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [redrawCanvas])

  // Handle mouse events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    const newDrawing: DrawingData = {
      x,
      y,
      type: 'start'
    }
    setDrawings(prev => [...prev, newDrawing])
  }

  const drawLine = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newDrawing: DrawingData = {
      x,
      y,
      type: 'draw'
    }
    setDrawings(prev => [...prev, newDrawing])
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    const newDrawing: DrawingData = {
      x: 0,
      y: 0,
      type: 'end'
    }
    setDrawings(prev => [...prev, newDrawing])
  }

  // Clear canvas
  const clearCanvas = () => {
    setDrawings([])
  }

  // Expose clear method
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).clearCanvas = clearCanvas
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="w-full h-full cursor-crosshair rounded-xl"
        style={{
          backgroundColor: 'var(--color-light)'
        }}
        onMouseDown={startDrawing}
        onMouseMove={drawLine}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      {/* Clear button */}
      <button
        onClick={clearCanvas}
        className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        title="Clear whiteboard"
      >
        Clear
      </button>
    </div>
  )
}
