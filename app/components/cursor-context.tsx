'use client'

import { usePathname } from 'next/navigation'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface CursorContextType {
  isCursorEnabled: boolean
  isCursorAllowed: boolean
  toggleCursor: () => void
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)
const CURSOR_DISABLED_PATH_PREFIXES = ['/feed-app']

function isCursorAllowedOnPath(pathname: string | null): boolean {
  if (!pathname) {
    return true
  }

  return !CURSOR_DISABLED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function CursorProvider({ children }: { children: ReactNode }) {
  const [isCursorEnabled, setIsCursorEnabled] = useState(true)
  const pathname = usePathname()
  const isCursorAllowed = isCursorAllowedOnPath(pathname)

  const updateCursorClass = useCallback((enabled: boolean) => {
    if (enabled) {
      document.documentElement.classList.remove('cursor-disabled')
    } else {
      document.documentElement.classList.add('cursor-disabled')
      // Force restore system cursor when disabled
      document.body.style.cursor = 'auto'
      document.documentElement.style.cursor = 'auto'
    }
  }, [])

  const toggleCursor = useCallback(() => {
    if (!isCursorAllowed) {
      updateCursorClass(false)
      return
    }

    setIsCursorEnabled(prev => {
      const newValue = !prev
      // Save to localStorage
      try {
        localStorage.setItem('customCursorEnabled', newValue.toString())
      } catch (error) {
        console.warn('Failed to save cursor preference to localStorage:', error)
      }
      // Update CSS class
      updateCursorClass(newValue)
      return newValue
    })
  }, [isCursorAllowed, updateCursorClass])

  useEffect(() => {
    // Add keyboard event listener for Ctrl+Shift+Space
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+Space using both code and key for better compatibility
      if (
        event.ctrlKey && 
        event.shiftKey && 
        (event.code === 'Space' || event.key === ' ' || event.keyCode === 32)
      ) {
        if (!isCursorAllowed) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        toggleCursor()
      }
    }

    // Use capture phase to catch the event early
    document.addEventListener('keydown', handleKeyDown, true)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isCursorAllowed, toggleCursor])

  useEffect(() => {
    if (!isCursorAllowed) {
      setIsCursorEnabled(false)
      updateCursorClass(false)
      return
    }

    try {
      const savedPreference = localStorage.getItem('customCursorEnabled')
      const enabled = savedPreference === null ? true : savedPreference === 'true'
      setIsCursorEnabled(enabled)
      updateCursorClass(enabled)
    } catch {
      updateCursorClass(true)
    }
  }, [isCursorAllowed, updateCursorClass])

  return (
    <CursorContext.Provider value={{ isCursorEnabled, isCursorAllowed, toggleCursor }}>
      {children}
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = useContext(CursorContext)
  if (context === undefined) {
    throw new Error('useCursor must be used within a CursorProvider')
  }
  return context
}
