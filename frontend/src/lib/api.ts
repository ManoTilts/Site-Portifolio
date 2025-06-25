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