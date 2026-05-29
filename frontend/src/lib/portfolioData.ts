// Shared portfolio content reused by the themed experiences (Magic, Angler)
// so the data lives in one place instead of being duplicated per scene.

export const SKILLS: Record<string, string[]> = {
  Frontend: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
  Backend: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB'],
  Tools: ['Git', 'Docker', 'AWS', 'Figma', 'VS Code'],
  Art: ['Clip Studio Paint', 'Concept Art', 'Character Design', 'Storyboarding'],
}

// value is static; label resolves through the i18n key at render time.
export const STATS: { labelKey: string; value: string }[] = [
  { labelKey: 'about.stats.projects', value: '50+' },
  { labelKey: 'about.stats.clients', value: '25+' },
  { labelKey: 'about.stats.coffee', value: '∞' },
  { labelKey: 'about.stats.experience', value: '3+' },
]

export const SOCIAL_LINKS = {
  github: 'https://github.com/ManoTilts',
  linkedin: 'https://www.linkedin.com/in/felipe-mazzeo-barbosa/',
}

// The four content "sections" each themed scene exposes, with the i18n keys
// used for their label. `id` is stable; scenes attach their own iconography.
export type SectionId = 'about' | 'projects' | 'contact' | 'cv'

export const SECTIONS: { id: SectionId; labelKey: string }[] = [
  { id: 'about', labelKey: 'nav.about' },
  { id: 'projects', labelKey: 'nav.projects' },
  { id: 'contact', labelKey: 'nav.contact' },
  { id: 'cv', labelKey: 'hero.downloadCV' },
]
