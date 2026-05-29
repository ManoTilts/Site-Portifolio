import { Suspense, lazy } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import './App.css'

// Each strongly-themed experience is a large, self-contained alternate layout
// used only by its theme — load on demand so they stay out of the initial bundle.
const TerminalPortfolio = lazy(() => import('./components/TerminalPortfolio'))
const MagicPortfolio = lazy(() => import('./components/MagicPortfolio'))
const AnglerPortfolio = lazy(() => import('./components/AnglerPortfolio'))

function AppContent() {
  const { currentTheme } = useTheme()

  if (currentTheme === 'cmd') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <TerminalPortfolio />
      </Suspense>
    )
  }

  if (currentTheme === 'magic') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0a0518]" />}>
        <MagicPortfolio />
      </Suspense>
    )
  }

  if (currentTheme === 'angler') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-sky-300" />}>
        <AnglerPortfolio />
      </Suspense>
    )
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
