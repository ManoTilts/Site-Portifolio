// Pulls portfolio projects straight from the GitHub REST API (no backend, no
// auth token). A repo only appears if it carries one of CURATION_TOPICS, so you
// curate simply by adding the "portfolio" topic to a repo on GitHub.
//
// Notes:
//  - Unauthenticated GitHub API is limited to 60 req/hour/IP, so we cache the
//    result in localStorage (6h) and reuse a stale cache if a later fetch fails.
//  - There are no screenshots in the API, so we use GitHub's auto-generated
//    social-preview image as each project's thumbnail.

import { type Project } from './api'

const GITHUB_USER = 'ManoTilts'
// A repo is shown if it has ANY of these topics. Add one on GitHub to opt in.
const CURATION_TOPICS = ['portfolio', 'showcase']
// Topics that tweak behaviour rather than describe tech.
const META_TOPICS = new Set([...CURATION_TOPICS, 'featured'])

// Hand-picked repos to feature without needing a GitHub topic, with optional
// description overrides for repos that don't carry one on GitHub. To add more,
// either drop an entry here or add the "portfolio" topic to the repo on GitHub.
const CURATED: Record<string, { description?: string; featured?: boolean }> = {
  'disastrous-dungeon': { description: 'A dungeon adventure game built with the Godot engine.', featured: true },
  'ride-recover': { featured: true }, // keeps its GitHub (PT) description
  'tcc_escada_rolante': { description: 'Graduation capstone project (TCC) in Python.' },
  'ia-pessoas-cel': {}, // keeps its GitHub (PT) description
  'site-estoque': { description: 'Inventory management web application.' },
  'site-portifolio': { description: 'Interactive multi-theme portfolio — React, TypeScript & FastAPI (this site).' },
}

const CACHE_KEY = 'gh-projects-v2'
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

interface GithubRepo {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  topics?: string[]
  stargazers_count: number
  fork: boolean
  archived: boolean
  created_at: string
  pushed_at: string
}

const prettifyName = (name: string): string =>
  name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()

const mapRepo = (repo: GithubRepo): Project => {
  const topics = repo.topics ?? []
  const curated = CURATED[repo.name.toLowerCase()]
  const techTopics = topics.filter((tp) => !META_TOPICS.has(tp))
  const technologies = [repo.language, ...techTopics]
    .filter((v): v is string => Boolean(v))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 6)

  const description = curated?.description || repo.description || 'No description provided.'

  return {
    id: String(repo.id),
    title: prettifyName(repo.name),
    description,
    short_description: description,
    technologies,
    images: [],
    // GitHub auto-generates a social card image for every repo.
    thumbnail: `https://opengraph.githubassets.com/1/${GITHUB_USER}/${repo.name}`,
    links: {
      github: repo.html_url,
      live: repo.homepage || undefined,
    },
    category: repo.language || 'Other',
    featured: topics.includes('featured') || Boolean(curated?.featured),
    date_created: repo.created_at,
    date_updated: repo.pushed_at,
  }
}

const sortProjects = (a: Project, b: Project): number => {
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  return new Date(b.date_updated).getTime() - new Date(a.date_updated).getTime()
}

const readCache = (): Project[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; data: Project[] }
    if (Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed.data
  } catch {
    return null
  }
}

const readStaleCache = (): Project[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as { data: Project[] }).data : null
  } catch {
    return null
  }
}

/**
 * Fetch curated portfolio projects from GitHub. Returns [] when the user simply
 * hasn't tagged any repos yet; throws only when there's no data at all (no
 * network AND no cache) so the UI can show its "browse on GitHub" fallback.
 */
export async function fetchGithubProjects(): Promise<Project[]> {
  const fresh = readCache()
  if (fresh) return fresh

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)

    const repos = (await res.json()) as GithubRepo[]
    const projects = repos
      .filter((r) => !r.fork && !r.archived)
      .filter(
        (r) =>
          CURATED[r.name.toLowerCase()] !== undefined ||
          (r.topics ?? []).some((tp) => CURATION_TOPICS.includes(tp))
      )
      .map(mapRepo)
      .sort(sortProjects)

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: projects }))
    } catch {
      /* localStorage unavailable — non-fatal */
    }
    return projects
  } catch (err) {
    // Network error or rate-limit: fall back to a stale cache if we have one.
    const stale = readStaleCache()
    if (stale) return stale
    throw err
  }
}
