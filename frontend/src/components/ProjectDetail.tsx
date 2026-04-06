import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ExternalLink, 
  Github, 
  Calendar, 
  Tag, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Copy,
  Check,
  Monitor
} from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card, CardContent } from './ui/Card'
import { projectsApi, type Project } from '../lib/api'

interface ProjectDetailProps {
  projectId: string | null
  isOpen: boolean
  onClose: () => void
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, isOpen, onClose }) => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    if (projectId && isOpen) {
      fetchProject()
    }
  }, [projectId, isOpen])

  const fetchProject = async () => {
    if (!projectId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await projectsApi.getById(projectId)
      setProject(response.data)
      setCurrentImageIndex(0)
    } catch (err) {
      console.error('Failed to fetch project:', err)
      setError('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

  const nextImage = () => {
    if (project && project.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === project.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (project && project.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.images.length - 1 : prev - 1
      )
    }
  }

  const copyProjectUrl = async () => {
    if (project) {
      try {
        const url = `${window.location.origin}${window.location.pathname}#project-${project.id}`
        await navigator.clipboard.writeText(url)
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } catch (err) {
        console.error('Failed to copy URL:', err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Card className="h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                {project?.featured && (
                  <Badge variant="gradient" size="sm">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" size="sm">
                  {project?.category || 'Project'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyProjectUrl}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copiedUrl ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : project ? (
                <div className="p-6 space-y-8">
                  {/* Project Header */}
                  <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-gradient">
                      {project.title}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {project.short_description || project.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      {project.links?.live && (
                        <Button
                          onClick={() => window.open(project.links?.live, '_blank', 'noopener,noreferrer')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </Button>
                      )}
                      {project.links?.github && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(project.links?.github, '_blank', 'noopener,noreferrer')}
                        >
                          <Github className="w-4 h-4 mr-2" />
                          View Code
                        </Button>
                      )}
                      {project.links?.demo && project.links.demo !== project.links.live && (
                        <Button
                          variant="outline"
                          onClick={() => window.open(project.links?.demo, '_blank', 'noopener,noreferrer')}
                        >
                          <Monitor className="w-4 h-4 mr-2" />
                          Demo
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Image Gallery */}
                  {project.images && project.images.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold">Gallery</h3>
                      <div className="relative">
                        <motion.img
                          key={currentImageIndex}
                          src={project.images[currentImageIndex] || project.thumbnail || '/api/placeholder/800/400'}
                          alt={`${project.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-96 object-cover rounded-xl"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                        
                        {project.images.length > 1 && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70"
                              onClick={nextImage}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                              {project.images.map((_, index) => (
                                <button
                                  key={index}
                                  className={`w-3 h-3 rounded-full transition-colors ${
                                    index === currentImageIndex 
                                      ? 'bg-white' 
                                      : 'bg-white/50 hover:bg-white/75'
                                  }`}
                                  onClick={() => setCurrentImageIndex(index)}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Project Details Grid */}
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Description */}
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-2xl font-semibold mb-4">About This Project</h3>
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {project.long_description || project.description}
                          </p>
                        </div>
                      </div>

                      {/* Project Highlights */}
                      {project.highlights && project.highlights.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold mb-3">Key Features & Highlights</h4>
                          <ul className="space-y-2">
                            {project.highlights.map((highlight, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-primary mr-2 mt-1">✦</span>
                                <span className="text-muted-foreground">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Challenges & Solutions */}
                      {((project.challenges && project.challenges.length > 0) || 
                        (project.solutions && project.solutions.length > 0)) && (
                        <div className="grid md:grid-cols-2 gap-6">
                          {project.challenges && project.challenges.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 text-orange-500">Challenges</h4>
                              <ul className="space-y-2">
                                {project.challenges.map((challenge, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-orange-500 mr-2 mt-1">⚡</span>
                                    <span className="text-muted-foreground text-sm">{challenge}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {project.solutions && project.solutions.length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold mb-3 text-green-500">Solutions</h4>
                              <ul className="space-y-2">
                                {project.solutions.map((solution, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">✓</span>
                                    <span className="text-muted-foreground text-sm">{solution}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Project Info Sidebar */}
                    <div className="space-y-6">
                      {/* Technologies */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                          <Tag className="w-5 h-5 mr-2" />
                          Technologies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <Badge key={tech} variant="outline" className="text-sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          Project Details
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span>{formatDate(project.date_created)}</span>
                          </div>
                          {project.date_updated !== project.date_created && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Updated:</span>
                              <span>{formatDate(project.date_updated)}</span>
                            </div>
                          )}
                          {project.duration && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>{project.duration}</span>
                            </div>
                          )}
                          {project.role && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Role:</span>
                              <span>{project.role}</span>
                            </div>
                          )}
                          {project.team_size && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Team Size:</span>
                              <span>{project.team_size} {project.team_size === 1 ? 'person' : 'people'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="border-t border-border/50 pt-8">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-semibold">Interested in this project?</h3>
                      <p className="text-muted-foreground">
                        Feel free to explore the code, try the demo, or get in touch to discuss similar projects.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        {project.links?.github && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(project.links?.github, '_blank', 'noopener,noreferrer')}
                          >
                            <Github className="w-4 h-4 mr-2" />
                            Explore Code
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            onClose()
                            // Scroll to contact section
                            setTimeout(() => {
                              const contactSection = document.getElementById('contact')
                              if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth' })
                              }
                            }, 300)
                          }}
                        >
                          Get In Touch
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProjectDetail 