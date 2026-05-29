import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Eye, ArrowRight, Sparkles, Settings, Fish, Terminal } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { CVDownload } from './ui/CVDownload'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import type { Theme } from '../contexts/ThemeContext'

const names = ['ManoTilts', 'Felipe Barbosa']

const THEME_META: Record<Theme, { icon: React.ReactNode; label: string; color: string }> = {
  default: { icon: <Settings size={16} />, label: 'Default', color: '#6366f1' },
  angler:  { icon: <Fish size={16} />,     label: 'Angler',  color: '#38bdf8' },
  magic:   { icon: <Sparkles size={16} />, label: 'Magic',   color: '#a855f7' },
  cmd:     { icon: <Terminal size={16} />, label: 'CMD',     color: '#22c55e' },
}

const Hero = () => {
  const { currentTheme, cycleTheme } = useTheme()
  const { t } = useLanguage()
  const [displayedName, setDisplayedName] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentNameIndex, setCurrentNameIndex] = useState(0)
  const [themeHint, setThemeHint] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: 'easeOut' }
  }

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.12 } }
  }

  // Reduced to 4 orbs for performance
  const floatingOrbs = useMemo(() => {
    return [
      { id: 0, width: 380, height: 380, left: 5,  top: 10, duration: 22, className: 'bg-primary/10' },
      { id: 1, width: 280, height: 280, left: 75, top: 60, duration: 26, className: 'bg-purple-500/10' },
      { id: 2, width: 200, height: 200, left: 40, top: 75, duration: 18, className: 'bg-pink-500/8' },
      { id: 3, width: 320, height: 320, left: 60, top: 5,  duration: 30, className: 'bg-primary/5' },
    ]
  }, [])

  // Typewriter effect for default theme only
  const typewriterEffect = useCallback(() => {
    if (currentTheme !== 'default') return
    const currentName = names[currentNameIndex]

    if (isTyping) {
      if (displayedName.length < currentName.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedName(prev => currentName.slice(0, prev.length + 1))
        }, 100)
      } else {
        timeoutRef.current = setTimeout(() => setIsTyping(false), 2000)
      }
    } else {
      if (displayedName.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedName(prev => prev.slice(0, -1))
        }, 50)
      } else {
        setCurrentNameIndex(prev => (prev + 1) % names.length)
        setIsTyping(true)
      }
    }
  }, [currentTheme, currentNameIndex, isTyping, displayedName])

  useEffect(() => {
    if (currentTheme !== 'default') {
      setDisplayedName('Felipe')
      return
    }
    const timeout = setTimeout(typewriterEffect, 100)
    return () => {
      clearTimeout(timeout)
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null }
    }
  }, [currentTheme, typewriterEffect])

  useEffect(() => {
    if (currentTheme === 'default') {
      setDisplayedName('')
      setCurrentNameIndex(0)
      setIsTyping(true)
    } else {
      setDisplayedName('Felipe')
    }
  }, [currentTheme])

  const handleCycleTheme = () => {
    cycleTheme()
    setThemeHint(true)
    setTimeout(() => setThemeHint(false), 1800)
  }

  const meta = THEME_META[currentTheme]

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute inset-0 gradient-mesh" />
      </div>

      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingOrbs.map(orb => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full blur-3xl ${orb.className}`}
            style={{ width: `${orb.width}px`, height: `${orb.height}px`, left: `${orb.left}%`, top: `${orb.top}%` }}
            animate={{ x: [0, 80, -40, 0], y: [0, -80, 40, 0], scale: [1, 1.15, 0.9, 1] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Welcome badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge variant="gradient" size="lg" className="animate-float">
              <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
              {t('hero.welcome')}
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-5 leading-tight"
          >
            {t('hero.greeting')}{' '}
            <span className="text-gradient animate-gradient bg-[length:300%_300%] relative">
              {displayedName}
              {currentTheme === 'default' && (
                <motion.span
                  className="inline-block w-1 h-[0.8em] bg-primary ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            variants={fadeInUp}
            className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.h2>

          {/* CTA buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <a href="#projects">
              <Button size="lg" variant="gradient" className="group min-w-[180px]">
                <Eye className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                {t('hero.viewWork')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </Button>
            </a>
            <CVDownload variant="dropdown" size="lg" className="min-w-[180px]" />
          </motion.div>

          {/* Theme Cycler — key discovery feature */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3 mb-14">
            <div className="relative inline-flex flex-col items-center">
              <motion.button
                onClick={handleCycleTheme}
                className="group flex items-center gap-3 px-5 py-3 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm hover:border-primary/50 hover:bg-card/70 transition-all duration-300"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.span
                  className="flex items-center justify-center w-7 h-7 rounded-lg"
                  style={{ background: `${meta.color}22`, color: meta.color }}
                  key={currentTheme}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {meta.icon}
                </motion.span>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Theme: <span className="text-foreground font-semibold">{meta.label}</span>
                </span>
                <span className="text-xs text-muted-foreground/60 border border-border/40 rounded px-1.5 py-0.5">cycle →</span>
              </motion.button>

              {/* Theme hint tooltip */}
              <AnimatePresence>
                {themeHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute -bottom-10 text-xs font-medium px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/20 whitespace-nowrap"
                  >
                    Switched to {THEME_META[currentTheme].label} ✨
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme dots */}
            <div className="flex items-center gap-2 mt-1">
              {(['default', 'angler', 'magic', 'cmd'] as const).map(t => (
                <div
                  key={t}
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    background: THEME_META[t].color,
                    opacity: currentTheme === t ? 1 : 0.25,
                    transform: currentTheme === t ? 'scale(1.6)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div variants={fadeInUp}>
            <motion.a
              href="#about"
              className="inline-flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors group"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-sm mb-3 font-medium">{t('hero.scrollExplore')}</span>
              <div className="p-2 rounded-full border border-border group-hover:border-primary/40 transition-colors">
                <ChevronDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" strokeWidth={1.5} />
              </div>
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero