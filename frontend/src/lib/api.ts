import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export interface Project {
  id: string
  title: string
  description: string
  short_description?: string
  long_description?: string
  technologies: string[]
  images: string[]
  thumbnail?: string
  links?: {
    github?: string
    live?: string
    demo?: string
  }
  category: string
  featured: boolean
  challenges?: string[]
  solutions?: string[]
  highlights?: string[]
  duration?: string
  team_size?: number
  role?: string
  date_created: string
  date_updated: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

// Project API
export const projectsApi = {
  getAll: (params?: {
    category?: string
    featured?: boolean
    search?: string
    page?: number
    per_page?: number
  }) => api.get<PaginatedResponse<Project>>('/projects', { params }),
  
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  
  getFeatured: (limit = 6) => api.get<Project[]>('/projects/featured', {
    params: { limit }
  }),
  
  getCategories: () => api.get<{
    categories: { name: string; count: number }[]
    total_categories: number
  }>('/projects/categories'),
}

// Contact API
export const contactApi = {
  send: (data: ContactForm) => api.post('/contact', data),
}

// CV API
export const cvApi = {
  getInfo: (language?: 'en' | 'pt') => api.get<{
    available: boolean
    filename?: string
    size?: number
    size_mb?: number
    last_modified?: number
    download_url?: string
    view_url?: string
    message?: string
    language?: string
    language_name?: string
  }>('/cv/info', { 
    params: language ? { language } : undefined 
  }),
  
  download: (language: 'en' | 'pt' = 'en') => {
    window.open(`${API_BASE_URL}/cv/download?language=${language}`, '_blank')
  },
  
  view: (language: 'en' | 'pt' = 'en') => {
    window.open(`${API_BASE_URL}/cv/view?language=${language}`, '_blank')
  },
  
  upload: (file: File, language: 'en' | 'pt') => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { language }
    })
  },

  getSupportedLanguages: () => api.get<{
    languages: Array<{
      code: string
      name: string
      native_name: string
    }>
  }>('/cv/languages'),
} 