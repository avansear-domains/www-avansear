'use client'

import { motion } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'
import { useCursor } from './cursor-context'

function ArrowIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CustomCursor() {
  const { isCursorEnabled } = useCursor()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(true) // Start visible for Safari
  const [isHovering, setIsHovering] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const isClickable = target.closest('a, button, [role="button"], input, select, textarea') !== null
    setIsHovering(isClickable)
  }, [])

  const checkScreenSize = useCallback(() => {
    // md breakpoint is 768px in Tailwind
    const isMdOrLarger = window.innerWidth >= 768
    setIsDesktop(isMdOrLarger)
  }, [])

  useEffect(() => {
    // Feature detection approach (alternative to browser detection)
    const testCursorSupport = () => {
      const testEl = document.createElement('div')
      testEl.style.cursor = 'none'
      return testEl.style.cursor === 'none'
    }
    
    // Browser detection for specific optimizations (still needed for quirks)
    const userAgent = navigator.userAgent.toLowerCase()
    const isFirefox = userAgent.indexOf('firefox') > -1
    const isSafari = (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) || 
                     userAgent.indexOf('version/') > -1 // Better Safari detection
    const isWebKit = userAgent.indexOf('webkit') > -1
    const hasCursorSupport = testCursorSupport()
    
    // Set mounted state and check initial screen size
    setIsMounted(true)
    checkScreenSize()
    
    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    // Add resize listener for responsive behavior
    window.addEventListener('resize', checkScreenSize, { passive: true })
    
    // Only add mouse listeners if desktop and cursor is enabled
    if (isDesktop && isCursorEnabled) {
      // Ensure document covers full viewport for cursor hiding
      document.documentElement.style.setProperty('min-height', '100vh', 'important')
      document.body.style.setProperty('min-height', '100vh', 'important')
      
      document.addEventListener('mousemove', updateMousePosition, { passive: true })
      document.addEventListener('mouseenter', handleMouseEnter)
      document.addEventListener('mouseleave', handleMouseLeave)
      document.addEventListener('mouseover', handleMouseOver, { passive: true })
      
      // Add a global style to ensure cursor is hidden everywhere, including scrollable areas
      const globalCursorStyle = document.createElement('style')
      globalCursorStyle.id = 'global-cursor-hide'
      globalCursorStyle.textContent = `
        html:not(.cursor-disabled),
        html:not(.cursor-disabled) *,
        html:not(.cursor-disabled) *::before,
        html:not(.cursor-disabled) *::after {
          cursor: none !important;
        }
        /* Ensure html grows with content, not constrained to viewport */
        html:not(.cursor-disabled) {
          min-height: 100vh !important;
          height: auto !important;
        }
        body:not(.cursor-disabled) {
          min-height: 100vh !important;
          height: auto !important;
        }
      `
      document.head.appendChild(globalCursorStyle)
      
      // Also ensure the document itself has cursor hidden
      if (document.documentElement) {
        document.documentElement.style.setProperty('cursor', 'none', 'important')
      }
    }

    // Ensure document/viewport always hides cursor
    if (isDesktop && isCursorEnabled) {
      // Apply to document element and ensure it covers full viewport
      // But allow it to grow with content (don't set height, only min-height)
      document.documentElement.style.setProperty('cursor', 'none', 'important')
      document.documentElement.style.setProperty('min-height', '100vh', 'important')
      // Remove any height constraint that might prevent growth
      document.documentElement.style.removeProperty('height')
      document.body.style.setProperty('cursor', 'none', 'important')
      document.body.style.setProperty('min-height', '100vh', 'important')
      // Remove any height constraint that might prevent growth
      document.body.style.removeProperty('height')
    }
    
    // Browser-specific cursor hiding optimizations (only on desktop and when enabled)
    if (isDesktop && isCursorEnabled && isFirefox) {
      // More aggressive Firefox cursor hiding
      document.body.style.cursor = 'none'
      document.documentElement.style.cursor = 'none'
      
      // Create a comprehensive style override for Firefox
      const firefoxStyle = document.createElement('style')
      firefoxStyle.id = 'firefox-cursor-override'
      firefoxStyle.textContent = `
        html, body, *, *::before, *::after {
          cursor: none !important;
        }
        a, button, input, select, textarea, [role="button"], [tabindex] {
          cursor: none !important;
        }
        *:hover, *:focus, *:active, *:visited {
          cursor: none !important;
        }
      `
      document.head.appendChild(firefoxStyle)
      
      // Force refresh cursor styles
      document.body.style.setProperty('cursor', 'none', 'important')
      
      // Add periodic cursor check for Firefox
      const firefoxCursorCheck = setInterval(() => {
        if (document.body.style.cursor !== 'none') {
          document.body.style.setProperty('cursor', 'none', 'important')
          document.documentElement.style.setProperty('cursor', 'none', 'important')
        }
      }, 100)
      
      // Store interval reference for cleanup
      ;(window as any).firefoxCursorInterval = firefoxCursorCheck
    }
    
    if (isDesktop && isCursorEnabled && (isSafari || isWebKit)) {
      // Safari sometimes needs additional cursor hiding
      document.body.style.cursor = 'none'
      document.documentElement.style.cursor = 'none'
      
      // Force Safari to respect cursor: none on all elements with delay
      setTimeout(() => {
        const style = document.createElement('style')
        style.id = 'safari-cursor-override'
        style.textContent = `
          *, *::before, *::after {
            cursor: none !important;
            -webkit-cursor: none !important;
          }
        `
        document.head.appendChild(style)
      }, 10)
      
      // Store reference for cleanup
      document.body.setAttribute('data-custom-cursor-style', 'true')
      
      // Force initial mouse position update for Safari
      const initialMouseEvent = new MouseEvent('mousemove', {
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2
      })
      setTimeout(() => {
        updateMousePosition(initialMouseEvent)
      }, 50)
    }

    return () => {
      // Remove resize listener
      window.removeEventListener('resize', checkScreenSize)
      
      // Remove mouse listeners (only if they were added)
      if (isDesktop) {
        document.removeEventListener('mousemove', updateMousePosition)
        document.removeEventListener('mouseenter', handleMouseEnter)
        document.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('mouseover', handleMouseOver)
        
        // Remove global cursor style
        const globalStyle = document.getElementById('global-cursor-hide')
        if (globalStyle) {
          globalStyle.remove()
        }
      }
      
      // Cleanup browser-specific styles
      if (isFirefox) {
        document.body.style.cursor = ''
        document.documentElement.style.cursor = ''
        
        // Remove Firefox-specific style override
        const firefoxStyle = document.getElementById('firefox-cursor-override')
        if (firefoxStyle) {
          firefoxStyle.remove()
        }
        
        // Clear periodic cursor check
        if ((window as any).firefoxCursorInterval) {
          clearInterval((window as any).firefoxCursorInterval)
          ;(window as any).firefoxCursorInterval = null
        }
      }
      
      if (isSafari || isWebKit) {
        document.body.style.cursor = ''
        document.documentElement.style.cursor = ''
        // Remove Safari-specific style injection
        const safariStyle = document.getElementById('safari-cursor-override')
        if (safariStyle) {
          safariStyle.remove()
        }
        document.body.removeAttribute('data-custom-cursor-style')
      }
    }
  }, [updateMousePosition, handleMouseOver, checkScreenSize, isDesktop, isCursorEnabled])

  // Calculate position with offset for hover state
  const offsetX = isHovering ? 6 : 4
  const offsetY = isHovering ? 6 : 4

  // Don't render until mounted (helps with Safari) or on mobile/small screens or when disabled
  if (!isMounted || !isDesktop || !isCursorEnabled) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-50"
      style={{
        willChange: 'transform, opacity'
      }}
      initial={{
        x: mousePosition.x - offsetX,
        y: mousePosition.y - offsetY,
        opacity: 0
      }}
      animate={{
        x: mousePosition.x - offsetX,
        y: mousePosition.y - offsetY,
        opacity: isVisible ? 1 : 0,
        scale: isHovering ? 1 : [1, 1.6, 0.9],
      }}
      transition={{
        x: { type: "tween", duration: 0 },
        y: { type: "tween", duration: 0 },
        opacity: { duration: 0.15 },
        scale: isHovering 
          ? { 
              type: "spring",
              stiffness: 300,
              damping: 25,
              mass: 0.3
            }
          : {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
      }}
    >
      {isHovering ? (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-6 h-6 bg-[var(--color-dark)] rounded-full blur-sm opacity-60" />
          <div className="relative text-[var(--color-light)] z-10">
            <ArrowIcon />
          </div>
        </div>
      ) : (
        <div className="w-2 h-2 bg-[var(--color-light)] rounded-full" />
      )}
    </motion.div>
  )
}