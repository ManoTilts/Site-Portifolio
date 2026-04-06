import { motion } from 'framer-motion'
import { Code2, Palette, Rocket, Users, Coffee, Award, Sparkles, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { useInView } from 'react-intersection-observer'
import { useLanguage } from '../contexts/LanguageContext'

const About = () => {
  const { t } = useLanguage()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const skills = {
    'Frontend': ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
    'Backend':  ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB'],
    'Tools':    ['Git', 'Docker', 'AWS', 'Figma', 'VS Code'],
    'Art':      ['Clip Studio Paint', 'Concept Art', 'Character Design', 'Storyboarding'],
  }

  const stats = [
    { icon: Code2,  label: t('about.stats.projects'),   value: '50+', color: 'text-blue-400' },
    { icon: Users,  label: t('about.stats.clients'),    value: '25+', color: 'text-green-400' },
    { icon: Coffee, label: t('about.stats.coffee'),     value: '∞',   color: 'text-amber-400' },
    { icon: Award,  label: t('about.stats.experience'), value: '3+',  color: 'text-purple-400' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  }

  const itemVariants = {
    hidden:   { opacity: 0, y: 25 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  }

  // Initials avatar with animated rings — intentional, not a broken image
  const InitialsAvatar = () => (
    <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-3xl border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ borderStyle: 'dashed' }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-4 rounded-2xl border border-purple-500/15"
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        style={{ borderStyle: 'dashed' }}
      />
      {/* Avatar card */}
      <div className="absolute inset-6 rounded-2xl bg-gradient-to-br from-primary/20 via-card to-purple-500/20 border border-border/50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
        <span className="text-5xl font-bold text-gradient select-none">FM</span>
        <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Felipe Barbosa</span>
      </div>
      {/* Corner accent dots */}
      <motion.div
        className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary"
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-purple-500"
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
      />
      {/* Floating badge */}
      <motion.div
        className="absolute -bottom-5 -right-4 p-2.5 bg-background/90 backdrop-blur-sm rounded-full border border-border/50 shadow-lg"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <Zap className="w-5 h-5 text-primary" />
      </motion.div>
    </div>
  )

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-56 h-56 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={containerVariants}>

          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-14">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-5">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">{t('about.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('about.subtitle')}
            </p>
          </motion.div>

          {/* About Text + Avatar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Text block */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                {t('about.greeting')}
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="inline-block"
                >
                  👋
                </motion.span>
              </h3>

              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{t('about.description1')}</p>
                <p className="text-muted-foreground leading-relaxed">{t('about.description2')}</p>
                <p className="text-muted-foreground leading-relaxed">{t('about.description3')}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { Icon: Palette, label: t('about.creativeDesign') },
                  { Icon: Rocket,  label: t('about.fastDevelopment') },
                ].map(({ Icon, label }) => (
                  <motion.div
                    key={label}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-card/50 border border-border/50"
                    whileHover={{ scale: 1.02, backgroundColor: 'hsl(var(--accent))' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Initials Avatar — replaces broken placeholder */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <InitialsAvatar />
            </motion.div>
          </div>

          {/* Skills Grid */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{t('about.skillsTitle')}</h3>
              <p className="text-muted-foreground">{t('about.skillsSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Object.entries(skills).map(([category, items], index) => (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card variant="default" className="h-full hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <div className="w-1.5 h-7 bg-gradient-to-b from-primary to-purple-500 rounded-full mr-3" />
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {items.map((skill, skillIndex) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.08 + skillIndex * 0.04 }}
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

          {/* Stats — below skills, smaller footprint */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.04, y: -4 }}
                className="text-center group"
              >
                <Card variant="glass" className="p-5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl mb-3 group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                  <div className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}

export default About