import { useState } from 'react'
import { Github, ExternalLink, Mail, MapPin, Phone, Linkedin, FileText, Download } from 'lucide-react'
import { cvApi, type Project } from '../../lib/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { SKILLS, SOCIAL_LINKS, type SectionId } from '../../lib/portfolioData'

export interface ContentPalette {
  body: string
  subtle: string
  accent: string
  card: string
  chip: string
  link: string
  heading: string
  // Drives the scene-specific project cover treatment.
  variant: 'magic' | 'angler'
}

/**
 * Compact project cover. In the Magic scene it's treated like a conjured
 * vision (arcane tint + glowing frame + a shimmer that sweeps across like a
 * spell); in Angler it's a clean framed photo. Falls back to a themed gradient
 * if the image fails to load, so a card never shows a broken image.
 */
const ProjectCover = ({ src, variant }: { src?: string; variant: 'magic' | 'angler' }) => {
  const [failed, setFailed] = useState(false)
  if (!src) return null

  if (variant === 'magic') {
    return (
      <div className="relative mb-3 h-24 overflow-hidden rounded-xl ring-1 ring-fuchsia-300/30 shadow-[0_0_22px_rgba(217,70,239,0.28)]">
        {failed ? (
          <div className="h-full w-full bg-[conic-gradient(from_0deg,#c026d3,#7c3aed,#4f46e5,#a855f7,#c026d3)] opacity-70" />
        ) : (
          <img
            src={src}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
            style={{ filter: 'saturate(1.2) brightness(0.82)' }}
          />
        )}
        {/* arcane tint + blend into the panel */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/70 via-fuchsia-600/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#160a35] to-transparent" />
        <span className="absolute right-2 top-1.5 text-sm text-fuchsia-200/90 drop-shadow-[0_0_6px_rgba(217,70,239,0.9)]">✦</span>
        {/* spell shimmer sweeping across the vision */}
        <div className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-fuchsia-200/25 to-transparent" />
      </div>
    )
  }

  // angler — a framed photo of the catch
  return (
    <div className="relative mb-3 h-24 overflow-hidden rounded-lg border border-teal-700/25">
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-200 to-teal-400 text-2xl">🐟</div>
      ) : (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-cyan-100/20" />
    </div>
  )
}

interface SectionContentProps {
  id: SectionId
  palette: ContentPalette
  projects: Project[]
  projectsError: boolean
}

/**
 * Renders the actual portfolio content for a section, styled via a palette so
 * the same markup serves both themed scenes (Magic chamber, Angler catch).
 */
export const SectionContent = ({ id, palette: p, projects, projectsError }: SectionContentProps) => {
  const { t } = useLanguage()

  if (id === 'about') {
    return (
      <div className="space-y-4">
        <p className={`leading-relaxed ${p.body}`}>{t('about.description1')}</p>
        <p className={`leading-relaxed text-sm ${p.subtle}`}>{t('about.description2')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {Object.entries(SKILLS).map(([group, items]) => (
            <div key={group} className={`rounded-xl p-3 ${p.card}`}>
              <h4 className={`text-xs uppercase tracking-widest mb-2 ${p.heading}`}>{group}</h4>
              <div className="flex flex-wrap gap-1.5">
                {items.map((skill) => (
                  <span key={skill} className={`text-xs px-2 py-0.5 rounded-md ${p.chip}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'projects') {
    if (projectsError || projects.length === 0) {
      return (
        <div className="text-center py-6">
          <p className={`mb-4 ${p.subtle}`}>{t('projects.noProjects')}</p>
          <a
            href={SOCIAL_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${p.link}`}
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className={`rounded-xl p-4 ${p.card}`}>
            <ProjectCover src={project.thumbnail} variant={p.variant} />
            <div className="flex items-start justify-between gap-3">
              <h4 className={`font-semibold ${p.body}`}>{project.title}</h4>
              <div className="flex gap-2 shrink-0">
                {project.links?.github && (
                  <a href={project.links.github} target="_blank" rel="noopener noreferrer" aria-label="Code" className={p.accent}>
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {project.links?.live && (
                  <a href={project.links.live} target="_blank" rel="noopener noreferrer" aria-label="Live" className={p.accent}>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            <p className={`text-sm mt-1 ${p.subtle}`}>{project.short_description || project.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.technologies?.slice(0, 5).map((tech) => (
                <span key={tech} className={`text-[11px] px-2 py-0.5 rounded ${p.chip}`}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (id === 'contact') {
    return (
      <div className="space-y-3">
        <a href={`mailto:${t('contact.emailValue')}`} className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${p.card}`}>
          <Mail className={`w-5 h-5 ${p.accent}`} />
          <span className={`text-sm break-all ${p.body}`}>{t('contact.emailValue')}</span>
        </a>
        <div className={`flex items-center gap-3 rounded-xl p-3 ${p.card}`}>
          <Phone className={`w-5 h-5 ${p.accent}`} />
          <span className={`text-sm ${p.body}`}>{t('contact.phoneValue')}</span>
        </div>
        <div className={`flex items-center gap-3 rounded-xl p-3 ${p.card}`}>
          <MapPin className={`w-5 h-5 ${p.accent}`} />
          <span className={`text-sm ${p.body}`}>{t('contact.locationValue')}</span>
        </div>
        <div className="flex gap-3 pt-1">
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${p.link}`}>
            <Github className="w-4 h-4" /> GitHub
          </a>
          <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${p.link}`}>
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        </div>
      </div>
    )
  }

  // cv
  return (
    <div className="space-y-3">
      <p className={`text-sm ${p.subtle}`}>{t('cv.downloadTitle')}</p>
      <button onClick={() => cvApi.download('en')} className={`w-full inline-flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${p.link}`}>
        <span className="flex items-center gap-2"><FileText className={`w-4 h-4 ${p.accent}`} /> {t('cv.downloadEnglish')}</span>
        <Download className="w-4 h-4" />
      </button>
      <button onClick={() => cvApi.download('pt')} className={`w-full inline-flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${p.link}`}>
        <span className="flex items-center gap-2"><FileText className={`w-4 h-4 ${p.accent}`} /> {t('cv.downloadPortuguese')}</span>
        <Download className="w-4 h-4" />
      </button>
    </div>
  )
}

export default SectionContent
