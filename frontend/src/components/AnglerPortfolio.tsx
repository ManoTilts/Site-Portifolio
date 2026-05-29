import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { type Project } from '../lib/api'
import { fetchGithubProjects } from '../lib/github'
import { useLanguage } from '../contexts/LanguageContext'
import { SECTIONS, type SectionId } from '../lib/portfolioData'
import SceneControls from './ui/SceneControls'
import SectionContent, { type ContentPalette } from './ui/SectionContent'

const ANGLER_PALETTE: ContentPalette = {
  body: 'text-sky-950',
  subtle: 'text-sky-900/70',
  accent: 'text-teal-600 hover:text-teal-500',
  card: 'border border-teal-700/15 bg-white/50',
  chip: 'bg-teal-600/10 border border-teal-700/20 text-teal-900',
  link: 'bg-teal-600/15 hover:bg-teal-600/25 border border-teal-700/20 text-teal-900',
  heading: 'text-teal-700/80',
  variant: 'angler',
}

// Cloud positions as % of the stage (left, top). Kept below the title band
// and clear of the top-right controls so they don't collide on small screens.
const CLOUDS: { id: SectionId; left: number; top: number }[] = [
  { id: 'about', left: 16, top: 30 },
  { id: 'projects', left: 39, top: 23 },
  { id: 'contact', left: 63, top: 31 },
  { id: 'cv', left: 84, top: 24 },
]

const AnglerPortfolio = () => {
  const { t } = useLanguage()
  const [active, setActive] = useState<SectionId | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsError, setProjectsError] = useState(false)

  const stageRef = useRef<HTMLDivElement>(null)
  const rodRef = useRef<HTMLSpanElement>(null)
  const cloudRefs = useRef<Partial<Record<SectionId, HTMLButtonElement | null>>>({})
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

  useEffect(() => {
    fetchGithubProjects()
      .then(setProjects)
      .catch(() => setProjectsError(true))
  }, [])

  // Compute the fishing line from the rod tip to the selected cloud, in
  // coordinates relative to the stage so the SVG overlay lines up exactly.
  const computeLine = useCallback(() => {
    if (!active || !stageRef.current || !rodRef.current) {
      setLine(null)
      return
    }
    const cloud = cloudRefs.current[active]
    if (!cloud) {
      setLine(null)
      return
    }
    const s = stageRef.current.getBoundingClientRect()
    const r = rodRef.current.getBoundingClientRect()
    const c = cloud.getBoundingClientRect()
    setLine({
      x1: r.left + r.width / 2 - s.left,
      y1: r.top + r.height / 2 - s.top,
      x2: c.left + c.width / 2 - s.left,
      y2: c.top + c.height / 2 - s.top,
    })
  }, [active])

  useLayoutEffect(() => {
    computeLine()
  }, [computeLine])

  useEffect(() => {
    window.addEventListener('resize', computeLine)
    return () => window.removeEventListener('resize', computeLine)
  }, [computeLine])

  // Gentle drifting clouds + a few birds.
  const birds = useMemo(() => [{ top: 22, delay: 0 }, { top: 30, delay: 4 }], [])

  const activeLabel = active ? t(SECTIONS.find((s) => s.id === active)!.labelKey) : ''

  return (
    <div
      ref={stageRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #7dd3fc 0%, #bae6fd 38%, #38bdf8 58%, #0ea5b7 78%, #0c6b8a 100%)' }}
    >
      <SceneControls accent="#38bdf8" />

      {/* Sun */}
      <div className="pointer-events-none absolute top-10 right-12 w-20 h-20 rounded-full bg-yellow-200 shadow-[0_0_60px_30px_rgba(254,240,138,0.6)]" />

      {/* Birds */}
      {birds.map((b, i) => (
        <motion.span
          key={i}
          className="absolute text-sky-900/40 text-lg"
          style={{ top: `${b.top}%` }}
          initial={{ left: '-5%' }}
          animate={{ left: '105%' }}
          transition={{ duration: 28, delay: b.delay, repeat: Infinity, ease: 'linear' }}
        >
          ︶
        </motion.span>
      ))}

      {/* Sea waves */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[42%] overflow-hidden">
        <motion.div
          className="absolute -top-2 left-0 w-[200%] h-full opacity-30"
          style={{ background: 'repeating-linear-gradient(120deg, transparent 0 28px, rgba(255,255,255,0.4) 28px 30px)' }}
          animate={{ x: ['0%', '-25%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Clouds (section selectors) */}
      {CLOUDS.map((cloud, i) => {
        const isActive = active === cloud.id
        return (
          <motion.button
            key={cloud.id}
            ref={(el) => { cloudRefs.current[cloud.id] = el }}
            onClick={() => setActive(cloud.id)}
            className="absolute z-20 flex flex-col items-center focus:outline-none"
            style={{ left: `${cloud.left}%`, top: `${cloud.top}%` }}
            initial={{ x: '-50%' }}
            animate={{ x: '-50%', y: [0, -8, 0], scale: isActive ? 1.12 : 1 }}
            transition={{ y: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }, scale: { duration: 0.3 } }}
            aria-label={`Cast for ${cloud.id}`}
          >
            <span
              className="text-5xl sm:text-6xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)] transition-all"
              style={isActive ? { filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.9))' } : undefined}
            >
              ☁️
            </span>
            <span className={`-mt-3 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm ${isActive ? 'bg-teal-600 text-white' : 'bg-white/80 text-sky-900'}`}>
              {t(SECTIONS.find((s) => s.id === cloud.id)!.labelKey)}
            </span>
          </motion.button>
        )
      })}

      {/* Fishing line overlay */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full z-20">
        {line && (
          <>
            <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="rgba(255,255,255,0.8)" strokeWidth={1.5} strokeDasharray="5 5" />
            <motion.circle
              r={5}
              fill="#0f766e"
              stroke="white"
              strokeWidth={1.5}
              initial={{ cx: line.x1, cy: line.y1 }}
              animate={{ cx: line.x2, cy: line.y2 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </>
        )}
      </svg>

      {/* Fisherman in boat */}
      <motion.div
        className="absolute left-1/2 bottom-[20%] z-10 flex flex-col items-center"
        initial={{ x: '-50%' }}
        animate={{ x: '-50%', y: [0, -6, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative">
          <span className="text-5xl sm:text-6xl select-none">🎣</span>
          {/* approximate rod tip */}
          <span ref={rodRef} className="absolute right-0 top-1 w-1 h-1" />
        </div>
        <span className="text-5xl sm:text-6xl -mt-3 select-none">🛶</span>
      </motion.div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center pt-20 sm:pt-16 px-4 pointer-events-none">
        <h1 className="text-3xl sm:text-4xl font-bold text-sky-950 drop-shadow-sm">Gone Fishing</h1>
        <p className="text-sky-900/70 text-sm mt-2">Cast toward a cloud to reel in what you seek · Felipe Mazzeo Barbosa</p>
      </motion.div>

      {/* The catch (content panel reeled in) */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, x: '-50%', y: 140 }}
            animate={{ opacity: 1, x: '-50%', y: 0 }}
            exit={{ opacity: 0, x: '-50%', y: 120 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.35 }}
            className="absolute left-1/2 bottom-4 z-30 w-[calc(100%-1.5rem)] max-w-xl"
          >
            <div className="relative rounded-3xl border-2 border-amber-800/30 bg-amber-50/90 backdrop-blur-md p-5 shadow-2xl">
              {/* little hook on top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">🪝</div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 text-lg font-bold text-sky-950">
                  <span className="text-xl">🐟</span> {activeLabel}
                </h3>
                <button onClick={() => setActive(null)} aria-label="Release the catch" className="text-sky-900/50 hover:text-sky-900 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[44vh] overflow-y-auto pr-1 terminal-scroll">
                <SectionContent id={active} palette={ANGLER_PALETTE} projects={projects} projectsError={projectsError} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AnglerPortfolio
