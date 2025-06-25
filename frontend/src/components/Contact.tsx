import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, MessageSquare, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { contactApi, type ContactForm } from '../lib/api'
import { useInView } from 'react-intersection-observer'

const Contact = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await contactApi.send(formData)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'hello@yourname.com',
      href: 'mailto:hello@yourname.com',
      color: 'text-blue-400'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567',
      color: 'text-green-400'
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'San Francisco, CA',
      href: 'https://maps.google.com',
      color: 'text-purple-400'
    }
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

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/3 rounded-full blur-3xl" />
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
              <MessageSquare className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Let's Work <span className="text-gradient">Together</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Have a project in mind? I'd love to hear about it. Send me a message and let's discuss how we can bring your ideas to life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h3>
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={index}
                    href={info.href}
                    className="block group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card variant="glass" className="p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                          <info.icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">{info.label}</p>
                          <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                            {info.value}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.a>
                ))}
              </div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants} className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Why Work With Me?</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" size="sm">⚡</Badge>
                    <span className="text-sm text-muted-foreground">Fast Response Time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" size="sm">🎯</Badge>
                    <span className="text-sm text-muted-foreground">Goal-Oriented Approach</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" size="sm">🔄</Badge>
                    <span className="text-sm text-muted-foreground">Iterative Process</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" size="sm">✨</Badge>
                    <span className="text-sm text-muted-foreground">Attention to Detail</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card variant="default" className="shadow-2xl shadow-primary/5 border-border/50">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl flex items-center">
                    <Sparkles className="w-6 h-6 mr-3 text-primary" />
                    Send me a message
                  </CardTitle>
                  <CardDescription className="text-base">
                    Fill out the form below and I'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/40"
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/40"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/40"
                        placeholder="What's this about?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-foreground">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200 hover:border-primary/40"
                        placeholder="Tell me about your project, goals, timeline, and any specific requirements..."
                      />
                    </div>

                    {/* Submit Status */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ 
                        opacity: submitStatus !== 'idle' ? 1 : 0,
                        height: submitStatus !== 'idle' ? 'auto' : 0
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {submitStatus === 'success' && (
                        <div className="flex items-center space-x-3 text-green-400 bg-green-400/10 p-4 rounded-xl border border-green-400/20">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Message sent successfully! I'll get back to you soon.</span>
                        </div>
                      )}
                      
                      {submitStatus === 'error' && (
                        <div className="flex items-center space-x-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                          <AlertCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Failed to send message. Please try again or contact me directly.</span>
                        </div>
                      )}
                    </motion.div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      variant="gradient"
                      size="lg"
                      className="w-full group"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                      ) : (
                        <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact 