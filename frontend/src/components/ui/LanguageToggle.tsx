import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Button } from './Button'

interface LanguageToggleProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en')
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleLanguage}
      className={`gap-2 font-medium ${className}`}
      title={language === 'en' ? 'Mudar para Português' : 'Switch to English'}
    >
      {language === 'en' ? (
        <>
          <span className="text-lg">🇺🇸</span>
          <span>EN</span>
        </>
      ) : (
        <>
          <span className="text-lg">🇧🇷</span>
          <span>PT</span>
        </>
      )}
    </Button>
  )
} 