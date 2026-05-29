import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'default' | 'angler' | 'magic' | 'cmd'

const THEME_ORDER: Theme[] = ['default', 'angler', 'magic', 'cmd']

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
  themeIndex: number
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Always open on the standard "default" layout. The immersive themes
  // (cmd / magic / angler) are opt-in per visit and intentionally NOT persisted,
  // so a returning visitor never lands straight in a terminal/scene.
  const [currentTheme, setCurrentTheme] = useState<Theme>('default')

  const applyTheme = useCallback((theme: Theme) => {
    document.body.className = ''
    document.body.classList.add(`theme-${theme}`)
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme)
    applyTheme(theme)
  }, [applyTheme])

  const cycleTheme = useCallback(() => {
    setCurrentTheme(prev => {
      const idx = THEME_ORDER.indexOf(prev)
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length]
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  // Apply theme on first mount
  useEffect(() => {
    applyTheme(currentTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const themeIndex = THEME_ORDER.indexOf(currentTheme)

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, cycleTheme, themeIndex }}>
      {children}
    </ThemeContext.Provider>
  )
}