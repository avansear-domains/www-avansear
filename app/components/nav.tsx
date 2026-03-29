'use client'

import { InternalHoverButton } from './hover-button'
import { changeTheme } from '../../utils/helper'
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
  '/beyond': {
    name: 'beyond',
  },
}

const themes = [
  {
    id: 'theme1',
    name: 'Theme 1',
    bgColor: '#9E2B25',
    borderColor: '#FFF8F0',
  },
  {
    id: 'theme2',
    name: 'Theme 2',
    bgColor: '#FFCB05',
    borderColor: '#00274C',
  },
  {
    id: 'theme3',
    name: 'Theme 3',
    bgColor: '#0F0F0E',
    borderColor: '#F196E5',
  },
  {
    id: 'theme4',
    name: 'Theme 4',
    bgColor: '#FFEFF5',
    borderColor: '#1F7CFF',
  },
  {
    id: 'theme5',
    name: 'Theme 5',
    bgColor: '#0C0C0C',
    borderColor: '#eeeeee',
  },
]

export function Navbar({ variant = 'default' }: { variant?: 'default' | 'floating' }) {
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('theme5')
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false)
  const floating = variant === 'floating'

  useEffect(() => {
    setMounted(true)

    const htmlElement = document.querySelector('html')
    const theme = htmlElement?.getAttribute('data-theme') || 'theme5'
    setCurrentTheme(theme)
  }, [])

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
    setThemeDropdownOpen(false)
  }

  const toggleThemeDropdown = () => {
    setThemeDropdownOpen(!themeDropdownOpen)
  }

  const activeTheme = themes.find((theme) => theme.id === currentTheme) || themes[0]

  const links = (
    <>
      {Object.entries(navItems).map(([path, { name }]) => (
        <InternalHoverButton
          key={path}
          href={path}
          className={floating ? 'shrink-0 whitespace-nowrap' : undefined}
        >
          {name}
        </InternalHoverButton>
      ))}
    </>
  )

  const themeDesktop = (
    <div className="hidden shrink-0 flex-row items-center space-x-1.5 sm:flex">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className="h-5 w-5 rounded-full border-2 transition-colors hover:opacity-80"
          style={{
            backgroundColor: theme.bgColor,
            borderColor: theme.borderColor,
          }}
          onClick={() => handleThemeChange(theme.id)}
          title={theme.name}
        />
      ))}
    </div>
  )

  const themeMobile = (
    <div className="theme-dropdown relative flex shrink-0 items-center sm:hidden">
      <button
        type="button"
        className="h-5 w-5 rounded-full border-2 transition-colors hover:opacity-80"
        style={{
          backgroundColor: activeTheme.bgColor,
          borderColor: activeTheme.borderColor,
        }}
        onClick={toggleThemeDropdown}
        title={`Current: ${activeTheme.name}`}
      />

      {themeDropdownOpen && (
        <div className="absolute right-0 top-8 z-50 rounded-lg">
          <div className="flex flex-col space-y-2">
            {themes
              .filter((theme) => theme.id !== currentTheme)
              .map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className="h-5 w-5 rounded-full border-2 transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: theme.bgColor,
                    borderColor: theme.borderColor,
                  }}
                  onClick={() => handleThemeChange(theme.id)}
                  title={theme.name}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )

  if (floating) {
    return (
      <header
        className="pointer-events-none fixed left-0 right-0 top-0 z-[60] flex justify-center px-3 pt-3 sm:px-4 sm:pt-4"
        aria-label="Site navigation"
      >
        <div className="pointer-events-auto flex w-full max-w-full flex-nowrap items-center justify-between gap-2 overflow-visible rounded-full border border-[var(--color-dark)]/15 bg-[var(--color-light)]/85 px-3 py-2 shadow-sm backdrop-blur-md dark:border-[var(--color-light)]/15 dark:bg-[var(--color-dark)]/85 sm:max-w-2xl sm:gap-3 sm:px-3">
          <nav
            className="fade flex min-w-0 flex-1 flex-nowrap items-center gap-x-2 overflow-visible tracking-tight"
            id="nav"
            aria-label="Primary"
          >
            {links}
          </nav>
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            {!mounted ? (
              <div className="h-5 w-5 shrink-0 rounded-full bg-[var(--color-dark)]/20" aria-hidden />
            ) : (
              <>
                {themeDesktop}
                {themeMobile}
              </>
            )}
          </div>
        </div>
      </header>
    )
  }

  if (!mounted) {
    return (
      <aside className="-ml-[8px] mb-10 sm:mb-16 tracking-tight overflow-visible">
        <div className="lg:sticky lg:top-20 overflow-visible">
          <nav
            className="flex flex-row items-center justify-between relative px-0 pb-0 fade overflow-visible md:relative"
            id="nav"
          >
            <div className="flex flex-row items-center overflow-visible space-x-2">{links}</div>
            <div className="flex flex-row items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-gray-300" />
              <div className="h-5 w-5 rounded-full bg-gray-300" />
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
          <div className="flex flex-row items-center overflow-visible space-x-2">{links}</div>
          {themeDesktop}
          {themeMobile}
        </nav>
      </div>
    </aside>
  )
}
