import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Theme = 'default' | 'angler' | 'magic' | 'cmd'

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (theme: Theme) => void
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
  const [currentTheme, setCurrentTheme] = useState<Theme>('default')

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    // For now, only 'default' theme is implemented
    // Other themes will be added later
  }

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
} 