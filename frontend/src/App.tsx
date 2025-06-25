import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
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

export default App
