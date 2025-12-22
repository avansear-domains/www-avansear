'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface CursorContextType {
  isCursorEnabled: boolean
  toggleCursor: () => void
}

const CursorContext = createContext<CursorContextType | undefined>(undefined)

export function CursorProvider({ children }: { children: ReactNode }) {
  const [isCursorEnabled, setIsCursorEnabled] = useState(true)

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
  }, [updateCursorClass])

  useEffect(() => {
    // Load preference from localStorage on mount
    try {
      const savedPreference = localStorage.getItem('customCursorEnabled')
      if (savedPreference !== null) {
        const enabled = savedPreference === 'true'
        setIsCursorEnabled(enabled)
        updateCursorClass(enabled)
      }
    } catch (error) {
      // localStorage might not be available (e.g., SSR)
      console.warn('Failed to load cursor preference from localStorage:', error)
    }

    // Add keyboard event listener for Ctrl+Shift+Space
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+Space using both code and key for better compatibility
      if (
        event.ctrlKey && 
        event.shiftKey && 
        (event.code === 'Space' || event.key === ' ' || event.keyCode === 32)
      ) {
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
  }, [toggleCursor, updateCursorClass])

  return (
    <CursorContext.Provider value={{ isCursorEnabled, toggleCursor }}>
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
