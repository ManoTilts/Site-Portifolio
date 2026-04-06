import React, { useState, useEffect, useRef } from 'react'
import { Download, FileText, ChevronDown } from 'lucide-react'
import { Button } from './Button'
import { useLanguage } from '../../contexts/LanguageContext'
import { cvApi } from '../../lib/api'
import { motion, AnimatePresence } from 'framer-motion'

type Language = 'en' | 'pt'

interface CVDownloadProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showIcon?: boolean
}

interface CVInfo {
  [key: string]: {
    available: boolean
    filename?: string
    size_mb?: number
    download_url?: string
    message?: string
  }
}

const cvLanguageOptions = [
  { 
    value: 'en' as Language, 
    label: 'English CV', 
    flag: '🇺🇸',
    filename: 'Felipe_Mazzeo_Barbosa_CV_English.pdf'
  },
  { 
    value: 'pt' as Language, 
    label: 'Currículo em Português', 
    flag: '🇧🇷',
    filename: 'Felipe_Mazzeo_Barbosa_CV_Portuguese.pdf'
  }
]

export const CVDownload: React.FC<CVDownloadProps> = ({ 
  variant = 'dropdown', 
  size = 'md',
  className = '',
  showIcon = true
}) => {
  const { language, t } = useLanguage()
  const [cvInfo, setCvInfo] = useState<CVInfo>({})
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkCVAvailability = async () => {
      try {
        const promises = cvLanguageOptions.map(async (option) => {
          try {
            const response = await cvApi.getInfo(option.value)
            return { language: option.value, data: response.data }
          } catch (error) {
            return { 
              language: option.value, 
              data: { 
                available: false, 
                message: 'CV not available' 
              } 
            }
          }
        })

        const results = await Promise.all(promises)
        const info: CVInfo = {}
        
        results.forEach(result => {
          info[result.language] = result.data
        })
        
        setCvInfo(info)
      } catch (error) {
        console.error('Error checking CV availability:', error)
      } finally {
        setLoading(false)
      }
    }

    checkCVAvailability()
  }, [])

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCVDownload = (cvLanguage: Language) => {
    const info = cvInfo[cvLanguage]
    if (info?.available) {
      cvApi.download(cvLanguage)
    } else {
      alert(t('cv.notAvailable'))
    }
  }

  const anyAvailable = Object.values(cvInfo).some(info => info.available)

  if (loading) {
    return (
      <Button 
        variant="outline" 
        size={size} 
        disabled
        className={className}
      >
        {showIcon && <Download className="mr-2 h-4 w-4" />}
        {t('common.loading')}
      </Button>
    )
  }

  if (variant === 'button') {
    // Single button that downloads based on current language
    const info = cvInfo[language]
    const isAvailable = info?.available

    return (
      <Button 
        variant="outline" 
        size={size} 
        className={`group ${!isAvailable ? 'opacity-75' : ''} ${className}`}
        onClick={() => handleCVDownload(language)}
        title={isAvailable ? t('hero.downloadCV') : t('cv.notAvailable')}
        disabled={!isAvailable}
      >
        {showIcon && (
          <Download className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
        )}
        {isAvailable ? t('hero.downloadCV') : t('hero.cvComingSoon')}
      </Button>
    )
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="outline"
        size={size}
        className={`group ${!anyAvailable ? 'opacity-75' : ''} ${className} flex items-center justify-between`}
        disabled={!anyAvailable}
        onClick={() => setIsOpen(!isOpen)}
        title={anyAvailable ? t('cv.downloadTitle') : t('cv.notAvailable')}
      >
        <div className="flex items-center">
          {showIcon && (
            <Download className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          )}
          {anyAvailable ? t('cv.selectLanguage') : t('hero.cvComingSoon')}
        </div>
        {anyAvailable && (
          <ChevronDown 
            className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && anyAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border rounded-lg shadow-xl z-50 overflow-hidden min-w-[250px]"
          >
            <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">
              {t('cv.downloadTitle')}
            </div>
            
            {cvLanguageOptions.map((option, index) => {
              const info = cvInfo[option.value]
              const isAvailable = info?.available

              return (
                <motion.button
                  key={option.value}
                  onClick={() => {
                    if (isAvailable) {
                      handleCVDownload(option.value)
                      setIsOpen(false)
                    }
                  }}
                  disabled={!isAvailable}
                  className={`flex items-center gap-3 w-full px-3 py-3 text-left transition-all duration-200 hover:bg-accent/50 ${
                    !isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  whileHover={isAvailable ? { x: 4 } : {}}
                >
                  <span className="text-lg">{option.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    {isAvailable && info?.size_mb && (
                      <div className="text-xs text-muted-foreground">
                        {info.size_mb.toFixed(1)} MB
                      </div>
                    )}
                  </div>
                  {isAvailable ? (
                    <FileText className="h-4 w-4 text-primary" />
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 