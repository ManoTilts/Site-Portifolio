import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import TerminalPortfolio from './components/TerminalPortfolio'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

function AppContent() {
  const { currentTheme } = useTheme()

  if (currentTheme === 'cmd') {
    return <TerminalPortfolio />
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark grid-pattern">
      <Header />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
