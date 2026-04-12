import { useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

const THEME_KEY = 'sparkleclean-theme'

/**
 * Hook for theme toggling with localStorage persistence.
 * Defaults to 'dark' to match the current design.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY)
      return (stored === 'light' || stored === 'dark') ? stored : 'dark'
    } catch {
      return 'dark'
    }
  })

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        // Ignore storage errors
      }
      // Toggle class on html element
      if (next === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.add('dark')
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}
