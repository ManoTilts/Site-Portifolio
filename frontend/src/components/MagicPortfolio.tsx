import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { projectsApi, type Project } from '../lib/api'
import { useLanguage } from '../contexts/LanguageContext'
import { SECTIONS, type SectionId } from '../lib/portfolioData'
import SceneControls from './ui/SceneControls'
import SectionContent, { type ContentPalette } from './ui/SectionContent'

// Drop a wizard image in /public as any of these names and it will be used
// automatically; otherwise the scene falls back to the 🧙‍♂️ emoji.
const WIZARD_SRCS = ['/wizard.png', '/wizard.jpg', '/wizard.jpeg', '/wizard.webp']

const RUNES: Record<SectionId, { glyph: string; tag: string }> = {
  about: { glyph: '📜', tag: 'Tome of Origin' },
  projects: { glyph: '⚔️', tag: 'Arcane Arsenal' },
  contact: { glyph: '🦉', tag: 'Summon the Owl' },
  cv: { glyph: '📖', tag: 'The Grimoire' },
}

const MAGIC_PALETTE: ContentPalette = {
  body: 'text-purple-100/90',
  subtle: 'text-purple-100/70',
  accent: 'text-fuchsia-300 hover:text-fuchsia-200',
  card: 'border border-purple-400/20 bg-purple-500/5',
  chip: 'bg-purple-400/10 border border-purple-300/20 text-purple-100/90',
  link: 'bg-purple-400/10 hover:bg-purple-400/20 border border-purple-300/20 text-purple-100',
  heading: 'text-fuchsia-300/80',
}

const MagicPortfolio = () => {
  const { t } = useLanguage()
  const [active, setActive] = useState<SectionId | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsError, setProjectsError] = useState(false)
  // Try a few filenames/formats in /public, then fall back to the emoji wizard.
  const [wizardSrcIdx, setWizardSrcIdx] = useState(0)
  const wizardImgOk = wizardSrcIdx < WIZARD_SRCS.length

  useEffect(() => {
    projectsApi
      .getFeatured(6)
      .then((res) => setProjects(res.data))
      .catch(() => setProjectsError(true))
  }, [])

  // A handful of drifting motes of light — kept small for performance.
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: 2 + (i % 3),
        delay: (i % 7) * 0.6,
        duration: 6 + (i % 5) * 2,
      })),
    []
  )

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-purple-50"
      style={{ background: 'radial-gradient(circle at 50% 30%, #2a1758 0%, #160a35 45%, #0a0518 100%)' }}
    >
      <SceneControls accent="#a855f7" />

      {/* Drifting motes of light */}
      <div className="pointer-events-none absolute inset-0">
        {motes.map((m) => (
          <motion.span
            key={m.id}
            className="absolute rounded-full bg-fuchsia-300/60"
            style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size }}
            animate={{ y: [0, -28, 0], opacity: [0.15, 0.8, 0.15] }}
            transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Corner torch glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-600/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 pt-20 pb-16 flex flex-col items-center">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide bg-gradient-to-r from-fuchsia-300 via-purple-200 to-violet-300 bg-clip-text text-transparent">
            The Scrying Chamber
          </h1>
          <p className="text-purple-200/60 text-sm mt-2">Touch a rune to gaze into the orb · Felipe Mazzeo Barbosa</p>
        </motion.div>

        {/* Wizard + Orb */}
        <div className="relative mb-8 flex flex-col items-center">
          {/* Ambient glow behind the wizard */}
          <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-purple-700/25 blur-3xl" />

          {/* Wizard figure (drop /wizard.png|jpg|webp in public to use the meme) */}
          {wizardImgOk ? (
            <motion.img
              src={WIZARD_SRCS[wizardSrcIdx]}
              onError={() => setWizardSrcIdx((i) => i + 1)}
              alt="The wizard contemplates the orb"
              draggable={false}
              className="relative z-0 w-[250px] sm:w-[330px] select-none rounded-2xl drop-shadow-[0_12px_45px_rgba(124,58,237,0.5)]"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, #000 62%, transparent 97%)',
                maskImage: 'linear-gradient(to bottom, #000 62%, transparent 97%)',
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <motion.span
              className="relative z-0 text-[7rem] sm:text-[9rem] leading-none select-none"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              🧙‍♂️
            </motion.span>
          )}

          {/* The scrying orb — emerges in front of the wizard's hands */}
          <motion.button
            onClick={() => setActive(active ? null : 'about')}
            className={`relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full focus:outline-none ${
              wizardImgOk ? '-mt-16 sm:-mt-24' : '-mt-6 sm:-mt-8'
            }`}
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            aria-label="The scrying orb"
          >
            <span className="absolute -inset-3 rounded-full bg-fuchsia-500/40 blur-2xl animate-pulse-glow" />
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #c026d3, #7c3aed, #4f46e5, #a855f7, #c026d3)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            />
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.55),transparent_45%)]" />
            <span className="absolute inset-0 rounded-full ring-2 ring-white/25" />
            <span className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl drop-shadow-lg">
              {active ? RUNES[active].glyph : '✨'}
            </span>
          </motion.button>
        </div>

        {/* Rune selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
          {SECTIONS.map((s) => {
            const isActive = active === s.id
            return (
              <motion.button
                key={s.id}
                onClick={() => setActive(s.id)}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 backdrop-blur-sm transition-colors ${
                  isActive
                    ? 'border-fuchsia-300/60 bg-fuchsia-500/15'
                    : 'border-purple-400/20 bg-purple-500/5 hover:border-purple-300/40'
                }`}
                style={isActive ? { boxShadow: '0 0 18px rgba(217,70,239,0.4)' } : undefined}
              >
                <span className="text-2xl">{RUNES[s.id].glyph}</span>
                <span className="text-sm font-medium text-purple-50">{t(s.labelKey)}</span>
                <span className="text-[10px] uppercase tracking-wider text-purple-200/50">{RUNES[s.id].tag}</span>
              </motion.button>
            )
          })}
        </div>

        {/* Vision panel */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-8 w-full max-w-2xl"
            >
              <div className="relative rounded-3xl border border-fuchsia-300/25 bg-[#160a35]/80 backdrop-blur-md p-5 sm:p-6 shadow-[0_0_40px_rgba(124,58,237,0.25)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-fuchsia-100">
                    <span className="text-xl">{RUNES[active].glyph}</span>{' '}
                    {t(SECTIONS.find((s) => s.id === active)!.labelKey)}
                  </h3>
                  <button onClick={() => setActive(null)} aria-label="Dispel the vision" className="text-purple-200/60 hover:text-fuchsia-200 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="max-h-[50vh] overflow-y-auto pr-1 terminal-scroll">
                  <SectionContent id={active} palette={MAGIC_PALETTE} projects={projects} projectsError={projectsError} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default MagicPortfolio
