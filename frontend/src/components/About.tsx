import React from 'react'
import { motion } from 'framer-motion'
import { Code2, Palette, Rocket, Users, Coffee, Award, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { useInView } from 'react-intersection-observer'

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const skills = {
    'Frontend': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
    'Backend': ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB'],
    'Tools': ['Git', 'Docker', 'AWS', 'Figma', 'VS Code'],
    'Design': ['UI/UX Design', 'Responsive Design', 'Accessibility', 'Design Systems']
  }

  const stats = [
    { icon: Code2, label: 'Projects Completed', value: '50+', color: 'text-blue-400' },
    { icon: Users, label: 'Happy Clients', value: '25+', color: 'text-green-400' },
    { icon: Coffee, label: 'Cups of Coffee', value: '∞', color: 'text-amber-400' },
    { icon: Award, label: 'Years Experience', value: '3+', color: 'text-purple-400' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
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

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-20">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="text-gradient">Me</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Passionate developer with a love for creating beautiful, functional, and user-friendly applications that make a difference.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
            {/* About Text */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-foreground flex items-center">
                  Hello! I'm a passionate developer
                  <motion.div
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="ml-2"
                  >
                    👋
                  </motion.div>
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  I'm a full-stack developer with 3+ years of experience creating digital experiences 
                  that are not only functional but also engaging. My journey started with a curiosity 
                  about how things work on the web, and it has evolved into a passion for creating 
                  solutions that make a difference.
                </p>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  When I'm not coding, you can find me exploring new technologies, contributing to 
                  open-source projects, or sharing knowledge with the developer community. I believe 
                  in writing clean, maintainable code and creating user experiences that delight.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 border border-border/50"
                  whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--accent))" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Creative Design</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3 p-4 rounded-xl bg-card/50 border border-border/50"
                  whileHover={{ scale: 1.02, backgroundColor: "hsl(var(--accent))" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Fast Development</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Profile Image */}
            <motion.div variants={itemVariants} className="relative">
              <motion.div 
                className="relative mx-auto w-80 h-80 rounded-3xl overflow-hidden border border-border/50"
                variants={floatingVariants}
                animate="animate"
              >
                <img
                  src="/api/placeholder/320/320"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-purple-500/20" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
              </motion.div>
              
              {/* Enhanced floating elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-28 h-28 bg-primary/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -bottom-6 -left-6 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Decorative elements */}
              <motion.div
                className="absolute top-4 right-4 p-3 bg-background/80 backdrop-blur-sm rounded-full border border-border/50"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Enhanced Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group"
              >
                <Card variant="glass" className="p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <motion.div 
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </motion.div>
                  <div className="text-3xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Skills */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Skills & <span className="text-gradient">Technologies</span>
              </h3>
              <p className="text-muted-foreground text-lg">
                The tools and technologies I use to bring ideas to life
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(skills).map(([category, items], index) => (
                <motion.div 
                  key={category} 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card variant="default" className="h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <div className="w-2 h-8 bg-gradient-to-b from-primary to-purple-500 rounded-full mr-3" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {items.map((skill, skillIndex) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (index * 0.1) + (skillIndex * 0.05) }}
                          >
                            <Badge 
                              variant="outline" 
                              className="text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-default"
                            >
                              {skill}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default About 