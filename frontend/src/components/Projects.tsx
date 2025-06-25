import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Github, Eye, Filter, Star, Calendar, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { projectsApi, type Project } from '../lib/api'
import { useInView } from 'react-intersection-observer'


const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsResponse, categoriesResponse] = await Promise.all([
          projectsApi.getAll({ per_page: 50 }),
          projectsApi.getCategories(),
        ])
        
        setProjects(projectsResponse.data.items)
        setCategories(['all', ...categoriesResponse.data.categories.map(c => c.name)])
      } catch (error) {
        console.error('Error fetching projects:', error)
        // No fallback - show database connection error
        setProjects([])
        setCategories(['all'])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  }

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={cardVariants} className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
              <Star className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Featured <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              A collection of projects that showcase my skills and passion for creating 
              exceptional digital experiences that solve real-world problems.
            </p>
          </motion.div>

          {/* Enhanced Category Filter */}
          <motion.div
            variants={cardVariants}
            className="flex flex-wrap justify-center gap-3 mb-16"
          >
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "gradient" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize group"
              >
                {category === 'all' ? (
                  <>
                    <Filter className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                    All Projects
                  </>
                ) : (
                  <>
                    {category}
                    <ArrowUpRight className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </Button>
            ))}
          </motion.div>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6 animate-pulse">
                    <div className="h-48 bg-muted/50 rounded-xl mb-6" />
                    <div className="h-6 bg-muted/50 rounded mb-3" />
                    <div className="h-4 bg-muted/50 rounded mb-2" />
                    <div className="h-4 bg-muted/50 rounded w-3/4" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={selectedCategory}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard 
                    key={`${selectedCategory}-${project.id}`} 
                    project={project} 
                    variants={cardVariants}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {filteredProjects.length === 0 && !loading && (
            <motion.div
              variants={cardVariants}
              className="text-center py-20"
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted/50 rounded-full mb-6">
                <Eye className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-xl font-medium">
                No projects found in this category.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Try selecting a different category or check back later.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

interface ProjectCardProps {
  project: Project
  variants: any
  index: number
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, variants, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div 
      variants={variants} 
      custom={index}
      whileHover={{ y: -8, scale: 1.02 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50">
        <div className="relative overflow-hidden">
          <motion.img
            src={project.thumbnail || '/api/placeholder/400/250'}
            alt={project.title}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          
          {/* Enhanced overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex gap-2">
                {project.links?.live && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Button size="sm" variant="secondary" className="backdrop-blur-sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Live Demo
                    </Button>
                  </motion.div>
                )}
                {project.links?.github && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button size="sm" variant="outline" className="backdrop-blur-sm">
                      <Github className="h-4 w-4 mr-2" />
                      Code
                    </Button>
                  </motion.div>
                )}
              </div>
              
              {project.featured && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: isHovered ? 1 : 0, rotate: isHovered ? 0 : -180 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge variant="gradient" size="sm">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Featured indicator */}
          {project.featured && (
            <div className="absolute top-4 right-4">
              <Badge 
                variant="gradient" 
                size="sm"
                className="backdrop-blur-sm"
              >
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
              {project.title}
            </CardTitle>
            {project.date_created && (
              <div className="flex items-center text-muted-foreground text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(project.date_created).getFullYear()}
              </div>
            )}
          </div>
          <CardDescription className="line-clamp-2 leading-relaxed">
            {project.short_description || project.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.slice(0, 4).map((tech, techIndex) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * techIndex }}
              >
                <Badge 
                  variant="outline" 
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                >
                  {tech}
                </Badge>
              </motion.div>
            ))}
            {project.technologies.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{project.technologies.length - 4} more
              </Badge>
            )}
          </div>
          
          {/* Category tag */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" size="sm" className="opacity-70">
              {project.category}
            </Badge>
            <motion.div
              className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ x: 5 }}
            >
              <ArrowUpRight className="w-4 h-4" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Projects 