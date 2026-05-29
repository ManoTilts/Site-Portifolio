import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github, Linkedin, Mail, Code2, Settings, Fish, Sparkles, Terminal } from 'lucide-react'
import { Button } from './ui/Button'
import { LanguageToggle } from './ui/LanguageToggle'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { cn } from '../lib/utils'
import type { Theme } from '../contexts/ThemeContext'

const THEMES: { value: Theme; icon: React.ReactNode; color: string; label: string }[] = [
  { value: 'default', icon: <Settings size={14} strokeWidth={1.5} />, color: '#6366f1', label: 'Default' },
  { value: 'angler',  icon: <Fish size={14} strokeWidth={1.5} />,     color: '#38bdf8', label: 'Angler' },
  { value: 'magic',   icon: <Sparkles size={14} strokeWidth={1.5} />, color: '#a855f7', label: 'Magic' },
  { value: 'cmd',     icon: <Terminal size={14} strokeWidth={1.5} />, color: '#22c55e', label: 'CMD' },
]

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null)
  const { currentTheme, setTheme } = useTheme()
  const { t, language } = useLanguage()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: t('nav.home'), href: '#home' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.projects'), href: '#projects' },
    { name: t('nav.contact'), href: '#contact' },
  ]

  const socialLinks = [
    { icon: Github,   href: 'https://github.com/ManoTilts', label: 'GitHub' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/felipe-mazzeo-barbosa/', label: 'LinkedIn' },
    { icon: Mail,     href: '#contact', label: 'Email' },
  ]

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5'
          : 'bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <motion.div className="flex-shrink-0" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href="#home" className="flex items-center space-x-2 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg">
                <Code2 size={20} strokeWidth={1.5} />
              </div>
              <span className="text-gradient">Portfolio</span>
            </a>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map(item => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="relative text-foreground/80 hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Desktop Right: Theme pill + Language + Socials */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Inline Theme Switcher — all 4 visible at a glance */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm">
              {THEMES.map(theme => (
                <div key={theme.value} className="relative">
                  <motion.button
                    onClick={() => setTheme(theme.value)}
                    onHoverStart={() => setHoveredTheme(theme.value)}
                    onHoverEnd={() => setHoveredTheme(null)}
                    className={cn(
                      'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                      currentTheme === theme.value
                        ? 'shadow-md'
                        : 'opacity-40 hover:opacity-80'
                    )}
                    style={currentTheme === theme.value
                      ? { background: `${theme.color}22`, color: theme.color }
                      : { color: theme.color }
                    }
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label={`Switch to ${theme.label} theme`}
                  >
                    {theme.icon}
                    {currentTheme === theme.value && (
                      <motion.div
                        layoutId="theme-active-dot"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: theme.color }}
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                      />
                    )}
                  </motion.button>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {hoveredTheme === theme.value && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs font-medium px-2 py-1 bg-card border border-border/60 rounded-lg whitespace-nowrap z-50 pointer-events-none"
                      >
                        {theme.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Language Toggle */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LanguageToggle key={`header-lang-${language}`} size="sm" />
            </motion.div>

            {/* Social Links */}
            <div className="flex items-center space-x-1">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={social.label}
                  className="text-foreground/60 hover:text-foreground p-2 rounded-lg transition-all duration-200 hover:bg-accent/50"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <social.icon size={18} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: 0, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
                    <X size={24} strokeWidth={1.5} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }} transition={{ duration: 0.2 }}>
                    <Menu size={24} strokeWidth={1.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="px-2 pt-4 pb-6 space-y-2 sm:px-3 bg-card/95 backdrop-blur-xl rounded-xl mt-4 border border-border/50 shadow-xl">
                {navItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    className="text-foreground/80 hover:text-foreground block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 hover:bg-accent/50"
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ x: 8 }}
                  >
                    {item.name}
                  </motion.a>
                ))}

                {/* Mobile: Language */}
                <motion.div
                  className="px-4 py-3 border-t border-border/30 mt-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Language / Idioma</p>
                  <LanguageToggle key={`mobile-lang-${language}`} size="md" className="w-full justify-center" />
                </motion.div>

                {/* Mobile: Theme row */}
                <motion.div
                  className="px-4 py-3"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <p className="text-sm text-muted-foreground mb-3 font-medium">Theme</p>
                  <div className="flex gap-2">
                    {THEMES.map(theme => (
                      <button
                        key={theme.value}
                        onClick={() => { setTheme(theme.value); setIsMobileMenuOpen(false) }}
                        className={cn(
                          'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-200',
                          currentTheme === theme.value
                            ? 'border-primary/50 bg-primary/10'
                            : 'border-border/40 bg-card/50 opacity-60 hover:opacity-90'
                        )}
                        style={currentTheme === theme.value ? { color: theme.color } : { color: theme.color }}
                        aria-label={theme.label}
                      >
                        {theme.icon}
                        <span className="text-xs font-medium text-foreground/70">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Mobile: Socials */}
                <motion.div
                  className="flex items-center justify-center space-x-4 px-4 py-4 border-t border-border/30 mt-4"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.3 }}
                >
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="text-foreground/60 hover:text-foreground p-2 rounded-lg transition-all duration-200 hover:bg-accent/50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <social.icon size={20} strokeWidth={1.5} />
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}

export default Header