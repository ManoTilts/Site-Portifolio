import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter, Mail, Heart, Code2, ArrowUp, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()
  
  const socialLinks = [
    { icon: Github, href: 'https://github.com/ManoTilts', label: 'GitHub', color: 'hover:text-white' },
    { icon: Linkedin, href: 'https://www.linkedin.com/in/felipe-mazzeo-barbosa/', label: 'LinkedIn', color: 'hover:text-blue-400' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400' },
    { icon: Mail, href: '#contact', label: 'Email', color: 'hover:text-green-400' },
  ]

  const navLinks = [
    { name: t('nav.home'), href: '#home' },
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.projects'), href: '#projects' },
    { name: t('nav.contact'), href: '#contact' },
  ]

  const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX']

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-background border-t border-border/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white">
                    <Code2 size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient">Portfolio</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t('footer.description')}
                </p>
              </motion.div>

              {/* Skills Tags */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex flex-wrap gap-2"
              >
                {skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                  >
                    {skill}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-primary" />
                  {t('footer.quickLinks')}
                </h4>
                <nav className="space-y-3">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <a
                        href={link.href}
                        className="block text-muted-foreground hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 transform duration-200"
                      >
                        {link.name}
                      </a>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">{t('footer.getInTouch')}</h4>
                <div className="space-y-3 text-sm">
                  <div className="text-muted-foreground">
                    <strong className="text-foreground">{t('footer.email')}:</strong><br />
                    felipe.mazzeo.barbosa@outlook.com
                  </div>
                  <div className="text-muted-foreground">
                    <strong className="text-foreground">{t('footer.location')}:</strong><br />
                    São Paulo, SP
                  </div>
                  <div className="text-muted-foreground">
                    <strong className="text-foreground">{t('footer.status')}:</strong><br />
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      {t('footer.availableForWork')}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-foreground mb-4">{t('footer.connect')}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      aria-label={social.label}
                      className={`flex items-center space-x-2 p-3 bg-card/50 hover:bg-accent rounded-xl border border-border/50 hover:border-primary/20 transition-all duration-300 group ${social.color}`}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <social.icon size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">{social.label}</span>
                    </motion.a>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm mt-4">
                  {t('footer.connectMessage')}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-sm"
            >
              © {new Date().getFullYear()} Portfolio. {t('footer.rights')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <span>{t('footer.madeWithLove')}</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                </motion.div>
                <span>and React</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="group"
              >
                <ArrowUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                <span className="ml-1">{t('footer.top')}</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 