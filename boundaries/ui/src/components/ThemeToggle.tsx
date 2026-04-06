'use client'

import { useTheme } from 'next-themes'
import { useCallback, useSyncExternalStore } from 'react'
// @ts-ignore
import { ToggleDarkMode } from '@shortlink-org/ui-kit'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const isDark = resolvedTheme === 'dark'

  const handleToggle = useCallback(() => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)
  }, [isDark, setTheme])

  if (!mounted) {
    return null
  }

  const toggleId = 'ThemeToggle'

  return (
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '8rem',
        zIndex: 9999,
      }}
    >
      {/*
        Do not put onClick on this wrapper: label → input onChange already calls handleToggle via
        ToggleDarkMode; bubbling would run handleToggle twice and cancel the theme change.
      */}
      <ToggleDarkMode
        id={toggleId}
        checked={isDark}
        onClick={handleToggle}
        ariaLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      />
    </div>
  )
}
