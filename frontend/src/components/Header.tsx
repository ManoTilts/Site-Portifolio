import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github, Linkedin, Mail, Code2 } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ]

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#contact', label: 'Email' },
  ]

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5" 
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with enhanced styling */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a href="#home" className="flex items-center space-x-2 text-2xl font-bold">
              <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg">
                <Code2 size={20} />
              </div>
              <span className="text-gradient">Portfolio</span>
            </a>
          </motion.div>

          {/* Desktop Navigation with enhanced styling */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
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

          {/* Social Links with enhanced animations */}
          <div className="hidden md:flex items-center space-x-2">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                aria-label={social.label}
                className="text-foreground/60 hover:text-foreground p-2 rounded-lg transition-all duration-200 hover:bg-accent/50 hover:shadow-md"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <social.icon size={18} />
              </motion.a>
            ))}
          </div>

          {/* Mobile menu button with enhanced styling */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              className="relative overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 0, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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
                <motion.div 
                  className="flex items-center justify-center space-x-4 px-4 py-4 border-t border-border/30 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
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
                      <social.icon size={20} />
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