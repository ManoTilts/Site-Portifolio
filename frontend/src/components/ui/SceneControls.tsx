import { motion } from 'framer-motion'
import { Fish, Sparkles, Terminal, LayoutGrid } from 'lucide-react'
import { useTheme, type Theme } from '../../contexts/ThemeContext'
import { LanguageToggle } from './LanguageToggle'
import { cn } from '../../lib/utils'

const THEMES: { value: Theme; icon: React.ReactNode; label: string; color: string }[] = [
  { value: 'default', icon: <LayoutGrid size={15} strokeWidth={1.5} />, label: 'Default', color: '#6366f1' },
  { value: 'angler', icon: <Fish size={15} strokeWidth={1.5} />, label: 'Angler', color: '#38bdf8' },
  { value: 'magic', icon: <Sparkles size={15} strokeWidth={1.5} />, label: 'Magic', color: '#a855f7' },
  { value: 'cmd', icon: <Terminal size={15} strokeWidth={1.5} />, label: 'CMD', color: '#22c55e' },
]

/**
 * Floating controls shown inside the full-screen themed experiences
 * (Magic, Angler) so the visitor can switch themes / language and return to
 * the standard site without being trapped. Fixed to the top-right corner.
 */
export const SceneControls = ({ accent = '#a855f7' }: { accent?: string }) => {
  const { currentTheme, setTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed top-3 right-3 z-50 flex items-center gap-2"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingRight: 'env(safe-area-inset-right)' }}
    >
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md shadow-lg">
        {THEMES.map((theme) => (
          <button
            key={theme.value}
            onClick={() => setTheme(theme.value)}
            aria-label={`Switch to ${theme.label} theme`}
            title={theme.label}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200',
              currentTheme === theme.value ? 'scale-105' : 'opacity-45 hover:opacity-90'
            )}
            style={
              currentTheme === theme.value
                ? { background: `${theme.color}26`, color: theme.color, boxShadow: `0 0 12px ${theme.color}55` }
                : { color: theme.color }
            }
          >
            {theme.icon}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md p-0.5" style={{ boxShadow: `0 0 14px ${accent}33` }}>
        <LanguageToggle size="sm" />
      </div>
    </motion.div>
  )
}

export default SceneControls
