import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Download, Eye, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { useTheme } from '../contexts/ThemeContext'

const names = ['ManoTilts', 'Felipe Barbosa']

const Hero = () => {
  const { currentTheme } = useTheme()
  const [displayedName, setDisplayedName] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentNameIndex, setCurrentNameIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  }

  const staggerContainer = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const floatingAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Memoize the floating orbs configuration to prevent re-renders
  const floatingOrbs = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: i,
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 20 + Math.random() * 10,
      className: i % 3 === 0 ? 'bg-primary/10' : 
                  i % 3 === 1 ? 'bg-purple-500/10' : 'bg-pink-500/10'
    }))
  }, [])

  // Typewriter effect for default theme only
  const typewriterEffect = useCallback(() => {
    if (currentTheme !== 'default') return

    const currentName = names[currentNameIndex]
    
    if (isTyping) {
      // Typing phase
      if (displayedName.length < currentName.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedName(prev => currentName.slice(0, prev.length + 1))
        }, 100)
      } else {
        // Finished typing, wait then start erasing
        timeoutRef.current = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
      }
    } else {
      // Erasing phase
      if (displayedName.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayedName(prev => prev.slice(0, -1))
        }, 50)
      } else {
        // Finished erasing, move to next name
        setCurrentNameIndex((prev) => (prev + 1) % names.length)
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [currentTheme, typewriterEffect])

  // Initialize the name display
  useEffect(() => {
    if (currentTheme === 'default') {
      setDisplayedName('')
      setCurrentNameIndex(0)
      setIsTyping(true)
    } else {
      setDisplayedName('Felipe')
    }
  }, [currentTheme])

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Enhanced background with grid pattern */}
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute inset-0 gradient-mesh" />
      </div>
      
      {/* Animated floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingOrbs.map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full blur-3xl ${orb.className}`}
            style={{
              width: `${orb.width}px`,
              height: `${orb.height}px`,
              left: `${orb.left}%`,
              top: `${orb.top}%`,
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.6, 0.3, 0.3],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Welcome badge */}
          <motion.div
            variants={fadeInUp}
            className="mb-8"
          >
            <Badge variant="gradient" size="lg" className="mb-4 animate-float">
              <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Welcome to my portfolio
            </Badge>
          </motion.div>

          {/* Main heading with enhanced gradient */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            Hi, I'm{' '}
            <span className="text-gradient animate-gradient bg-[length:300%_300%] relative">
              {displayedName}
              {currentTheme === 'default' && (
                <motion.span
                  className="inline-block w-1 h-[0.8em] bg-primary ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </span>
          </motion.h1>

          {/* Subtitle with better typography */}
          <motion.h2
            variants={fadeInUp}
            className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground mb-8 max-w-4xl mx-auto font-medium"
          >
            Computer Science Student & Aspiring{' '}
            <span className="text-foreground font-semibold">Game Developer</span> expanding into Full Stack
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Passionate about building immersive experiences through game development while expanding 
            my expertise in full-stack solutions. Set to graduate December 2025 and ready to bring 
            creativity and problem-solving skills to any development team.
          </motion.p>

          {/* Enhanced CTA buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button size="lg" variant="gradient" className="group min-w-[180px]">
              <Eye className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              View My Work
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
            </Button>
            <Button variant="outline" size="lg" className="group min-w-[180px]">
              <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
              Download CV
            </Button>
          </motion.div>

          {/* Enhanced floating elements */}
          <motion.div
            variants={floatingAnimation}
            animate="animate"
            className="flex justify-center space-x-8 mb-20"
          >
            {['React', 'TypeScript', 'Python', 'C#'].map((tech, index) => (
              <motion.div
                key={tech}
                className="hidden sm:block"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              >
                <Badge variant="outline" className="hover:border-primary/40 transition-all duration-300">
                  {tech}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeInUp}
            className="mt-20"
          >
            <motion.a
              href="#about"
              className="inline-flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors group"
              animate={{ 
                y: [0, 8, 0],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <span className="text-sm mb-3 font-medium">Scroll to explore</span>
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