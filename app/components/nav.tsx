'use client'

import { InternalHoverButton } from './hover-button'
import { changeTheme, getStoredTheme, applyStoredTheme } from '../../utils/helper'
import { useState, useEffect } from 'react'

const navItems = {
  '/': {
    name: 'home',
  },
  '/writings': {
    name: 'writings',
  },
  '/projects': {
    name: 'projects',
  },
  '/musix': {
    name: 'musix',
  },
}

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('theme5')
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get current theme from HTML data attribute (already set by blocking script)
    const htmlElement = document.querySelector('html')
    const theme = htmlElement?.getAttribute('data-theme') || 'theme5'
    setCurrentTheme(theme)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownOpen && !(event.target as Element).closest('.theme-dropdown')) {
        setThemeDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [themeDropdownOpen])

  const handleThemeChange = (theme: string) => {
    changeTheme(theme)
    setCurrentTheme(theme)
    setThemeDropdownOpen(false) // Close dropdown after selection
  }

  const toggleThemeDropdown = () => {
    setThemeDropdownOpen(!themeDropdownOpen)
  }

  // Theme configurations
  const themes = [
    { 
      id: 'theme1', 
      name: 'Theme 1', 
      bgColor: '#9E2B25', 
      borderColor: '#FFF8F0' 
    },
    { 
      id: 'theme2', 
      name: 'Theme 2', 
      bgColor: '#FFCB05', 
      borderColor: '#00274C' 
    },
    { 
      id: 'theme3', 
      name: 'Theme 3', 
      bgColor: '#0F0F0E', 
      borderColor: '#F196E5' 
    },
    { 
      id: 'theme4', 
      name: 'Theme 4', 
      bgColor: '#FFEFF5', 
      borderColor: '#1F7CFF'
    },
    { 
      id: 'theme5', 
      name: 'Theme 5', 
      bgColor: '#0C0C0C', 
      borderColor: '#eeeeee'
    }
  ]

  const activeTheme = themes.find(theme => theme.id === currentTheme) || themes[0]

  if (!mounted) {
    return (
      <aside className="-ml-[8px] mb-10 sm:mb-16 tracking-tight overflow-visible">
        <div className="lg:sticky lg:top-20 overflow-visible">
                      <nav
              className="flex flex-row items-center justify-between relative px-0 pb-0 fade overflow-visible md:relative"
              id="nav"
            >
              <div className="flex flex-row items-center overflow-visible space-x-2">
              {Object.entries(navItems).map(([path, { name }]) => {
                return (
                  <InternalHoverButton key={path} href={path}>
                    {name}
                  </InternalHoverButton>
                )
              })}
            </div>
            <div className="flex flex-row items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-gray-300"></div>
              <div className="w-5 h-5 rounded-full bg-gray-300"></div>
            </div>
          </nav>
        </div>
      </aside>
    )
  }

  return (
    <aside className="-ml-[8px] mb-10 sm:mb-16 tracking-tight overflow-visible">
      <div className="lg:sticky lg:top-20 overflow-visible">
        <nav
          className="flex flex-row items-center justify-between relative px-0 pb-0 fade overflow-visible md:relative"
          id="nav"
        >
          <div className="flex flex-row items-center overflow-visible space-x-2">
            {Object.entries(navItems).map(([path, { name }]) => {
              return (
                <InternalHoverButton key={path} href={path}>
                  {name}
                </InternalHoverButton>
              )
            })}
          </div>
          {/* Desktop: Show all themes */}
          <div className="hidden sm:flex flex-row items-center space-x-1.5">
            {themes.map((theme) => (
              <button
                key={theme.id}
                className={`w-5 h-5 rounded-full border-2 transition-colors hover:opacity-80`}
                style={{
                  backgroundColor: theme.bgColor,
                  borderColor: theme.borderColor,
                }}
                onClick={() => handleThemeChange(theme.id)}
                title={theme.name}
              ></button>
            ))}
          </div>

          {/* Mobile: Show dropdown */}
          <div className="sm:hidden relative theme-dropdown flex items-center">
            <button
              className={`w-5 h-5 rounded-full border-2 transition-colors hover:opacity-80`}
              style={{
                backgroundColor: activeTheme.bgColor,
                borderColor: activeTheme.borderColor,
              }}
              onClick={toggleThemeDropdown}
              title={`Current: ${activeTheme.name}`}
            ></button>

            {/* Dropdown */}
            {themeDropdownOpen && (
              <div className="absolute top-8 right-0 rounded-lg z-50">
                <div className="flex flex-col space-y-2">
                  {themes
                    .filter(theme => theme.id !== currentTheme) // Hide current theme
                    .map((theme) => (
                      <button
                        key={theme.id}
                        className={`w-5 h-5 rounded-full border-2 transition-colors hover:opacity-80`}
                        style={{
                          backgroundColor: theme.bgColor,
                          borderColor: theme.borderColor,
                        }}
                        onClick={() => handleThemeChange(theme.id)}
                        title={theme.name}
                      ></button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  )
}
